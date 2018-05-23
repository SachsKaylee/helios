/*
 * Contains the user API operations for Helios like logging in
 */
const config = require("../../config/server");
const crypto = require("crypto");

let $model;

const schema = ({ mongoose }) => {
  return mongoose.Schema({
    _id: String,
    password: String,
    permissions: [String]
  });
}

const install = ({ server, models, $send }) => {
  $model = models.user;
  const $sendUser = (res, { _id, permissions }) => $send(res, { data: { id: _id, permissions } });

  server.get("/api/user/:id", (req, res) => getUser(req.params.id)
    .then(user => $sendUser(res, user))
    .catch(error => $send(res, { error })));

  server.post("/api/user", (req, res) => {
    getSessionUser(req)
      .then(user => {
        if (hasPermission(user, permission.admin)) {
          const { password, id } = req.body;
          // todo: Check if new user does not have more permissions than the current one!
          const user = new $model({
            ...req.body,
            password: encrypt(password),
            _id: id
          });
          user.isNew = true;
          user.save((error, data) => data ? $sendUser(res, data) : $send(res, { error, data }));
        } else {
          $send.missingPermission(res, permission.admin);
        }
      })
      .catch(error => $send(res, { error }));
  });

  server.post("/api/session/login", (req, res) => {
    if (getSessionUserId(req)) {
      $send(res, { error: "already-logged-in", errorCode: 400 });
    } else {
      const { id, password } = req.body;
      getUser(id)
        .then(user => {
          if (user.password === encrypt(password)) {
            $setSessionUserId(req, id);
            $sendUser(res, user);
          } else {
            $send(res, { error: "incorrect-password", errorCode: 400 });
          }
        })
        .catch(error => $send(res, { error, errorCode: 400 }));
    }
  });

  server.post("/api/session/logout", (req, res) => {
    const id = getSessionUserId(req);
    if (id) {
      $setSessionUserId(req, undefined);
      $send(res, { data: id });
    } else {
      $send(res, { error: "not-logged-in", errorCode: 400 });
    }
  });

  server.get("/api/session", (req, res) =>
    getSessionUser(req)
      .then(user => $sendUser(res, user))
      .catch(error => $send(res, { error, errorCode: 400 })));

  $createDefaults();
}

// Create default content for the CMS
const $createDefaults = () => {
  if (config.defaultUser) {
    const { password, id } = config.defaultUser;
    const user = new $model({
      _id: id,
      password: encrypt(password),
      permissions: [permission.admin]
    });
    user.isNew = true;
    user.save((error, data) => {
      console.log("Default user created:", id, error, data);
    });
  }
}

const encrypt = password => crypto.createHmac("sha256", config.passwordSecret).update(password).digest("hex");

const getSession = req => req.session.helios || {};
const $setSession = (req, data) => req.session.helios = data;
const $putSession = (req, values) => $setSession(req, { ...getSession(req), ...values });

const getSessionUserId = req => getSession(req).userId;
const $setSessionUserId = (req, userId) => $putSession(req, { userId });

const getSessionUser = req => getSessionUserId(req) ? getUser(getSessionUserId(req)) : Promise.reject("not-logged-in");

const getUser = _id => new Promise((res, rej) => $model.findOne({ _id }, (error, data) => data && !error ? res(data) : rej(error)));

const hasPermission = (user, permission, notImpliedByAdmin) => user.permissions.includes(permission) || (!notImpliedByAdmin && user.permissions.includes(permission.admin));

// All permissions avilable.
const permission = {
  // The admin can do everything.
  admin: "admin",
  // The author can publish, delete and edit posts.
  author: "author"
};

module.exports = {
  install, schema,
  permission, hasPermission, getSessionUser, getSession, $putSession
}