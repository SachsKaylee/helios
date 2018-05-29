/*
 * Contains the user API operations for Helios like logging in
 */
const config = require("../../config/server");
const crypto = require("crypto");
const fp = require("../../fp");
const { default: Plain } = require("slate-plain-serializer");

let $model;

const schema = ({ mongoose }) => {
  return mongoose.Schema({
    _id: String,
    bio: Object,
    avatar: String,
    password: String,
    permissions: [String]
  });
}

const install = ({ server, models, $send }) => {
  $model = models.user;
  const $sendUser = (res, { _id, avatar, bio, permissions }) => $send(res, { data: { id: _id, bio, permissions } });

  // todo: handle if no default user exists (is that even reasonable?)
  server.get("/api/user", (req, res) => getUser(config.defaultUser.id)
    .then(user => $sendUser(res, user))
    .catch(error => $send(res, { error })));

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
            $send.incorrectPassword(res);
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

  server.put("/api/session", (req, res) => getSessionUser(req)
    .then(user => {
      const { password } = req.body;
      if (user.password !== encrypt(password)) {
        $send.incorrectPassword(res);
      } else {
        const { passwordNew, avatar, bio } = req.body;
        const newModel = createUpdatedModel(user, { password: passwordNew, avatar, bio });
        newModel.save((error, data) => (error || !data) ? $send(res, { error, data }) : $sendUser(res, data));
      }
    })
    .catch(error => $send(res, { error, errorCode: 400 })));

  server.get("/api/avatar/:id", (req, res) => getUser(req.params.id)
    .then(user => user.avatar
      ? $send.blob(res, user.avatar)
      : res.redirect("/static/content/system/default-avatar.png"))
    .catch(error => $send(res, { error })));

  $createDefaults();
}

const createUpdatedModel = (user, { password, avatar, permissions, bio }) => {
  const validPassword = password => password && ("string" === typeof password);
  // todo: make sure the avatar is of the right image format. We don't want users to upload malware!
  const validAvatar = avatar => avatar && ("string" === typeof avatar) && avatar.length <= 200 * 1024;
  const validPermissions = permissions => permissions && Array.isArray(permission) && fp.all(permissions, p => permission[p]);
  const validBio = bio => {
    if (!bio) return false;
    return true;// todo <<<---- this is broken, serialize is always ""!!!!!!!!!!!!! FIX ME FIX ME
    try { return Plain.serialize(bio).trim() !== ""; } 
    catch (_) { return false; }
  };

  console.log("bio", {bio,plain: Plain.serialize(bio), valid:validBio(bio)})

  const newUser = new $model({
    _id: user._id,
    permissions: validPermissions(permissions) ? permissions : user.permissions,
    password: validPassword(password) ? encrypt(password) : user.password,
    bio: validBio(bio) ? bio : user.bio,
    avatar: validAvatar(avatar) ? avatar : user.avatar
  });
  newUser.isNew = false;
  return newUser;
}

// Create default content for the CMS
const $createDefaults = () => {
  if (config.defaultUser) {
    const { password, id } = config.defaultUser;
    const user = new $model({
      _id: id,
      bio: Plain.deserialize("").toJSON(),
      avatar: "",
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