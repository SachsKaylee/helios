/*
 * Contains the user API operations for Helios like logging in
 */
const config = require("../../config/server");
const crypto = require("crypto");
const fp = require("../../fp");
const async = require("../../async");
const { default: Plain } = require("slate-plain-serializer");

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
  const encrypt = password => crypto.createHmac("sha256", config.passwordSecret).update(password).digest("hex");

  const getSession = req => req.session.helios || {};
  const $setSession = (req, data) => req.session.helios = data;
  const $putSession = (req, values) => $setSession(req, { ...getSession(req), ...values });

  const getSessionUserId = req => getSession(req).userId;
  const $setSessionUserId = (req, userId) => $putSession(req, { userId });

  const getSessionUser = req => getSessionUserId(req) ? getUser(getSessionUserId(req)) : Promise.reject("not-logged-in");

  const getUser = _id => new Promise((res, rej) => models.user.findOne({ _id }, (error, data) => data && !error ? res(data) : rej(error)));

  const hasPermission = (user, permission, notImpliedByAdmin) => user.permissions.includes(permission) || (!notImpliedByAdmin && user.permissions.includes("admin"));

  // All permissions avilable.
  const allPermissions = {
    // The admin can do everything.
    admin: "admin",
    // The author can publish, delete and edit posts.
    author: "author"
  };

  const createUpdatedModel = (user, { password, avatar, permissions, bio }) => {
    const validPassword = password => password && ("string" === typeof password);
    // todo: make sure the avatar is of the right image format. We don't want users to upload malware!
    const validAvatar = avatar => avatar && ("string" === typeof avatar) && avatar.length <= 200 * 1024;
    const validPermissions = permissions => permissions && Array.isArray(permissions) && fp.all(permissions, p => allPermissions[p]);
    const validBio = bio => {
      if (!bio) return false;
      return true;// todo <<<---- this is broken, serialize is always ""!!!!!!!!!!!!! FIX ME FIX ME
      try { return Plain.serialize(bio).trim() !== ""; }
      catch (_) { return false; }
    };

    console.log("bio", { bio, plain: Plain.serialize(bio), valid: validBio(bio) })

    const newUser = new models.user({
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
      const user = new models.user({
        _id: id,
        bio: Plain.deserialize("").toJSON(),
        avatar: "",
        password: encrypt(password),
        permissions: ["admin"]
      });
      user.isNew = true;
      user.save((error, data) => {
        console.log("Default user created:", id, error, data);
      });
    }
  }

  const filterUserData = ({ _id, avatar, bio, permissions }) => ({ id: _id, avatar, bio, permissions });

  const $sendUser = (res, user) => $send(res, { data: filterUserData(user) });
  const $sendUsers = (res, users) => $send(res, { data: users.map(filterUserData) });

  // todo: handle if no default user exists (is that even reasonable?)
  server.get("/api/user", (req, res) =>
    getUser(config.defaultUser.id)
      .then(user => $sendUser(res, user))
      .catch(error => $send(res, { error })));

  server.get("/api/user/:id", (req, res) =>
    getUser(req.params.id)
      .then(user => $sendUser(res, user))
      .catch(error => $send(res, { error })));

  server.get("/api/users", (req, res) =>
    models.user
      .find({})
      .exec((error, data) => data && !error
        ? $sendUsers(res, data)
        : $send(res, { error, data })));

  server.post("/api/user", (req, res) =>
    getSessionUser(req)
      .then(user => {
        if (hasPermission(user, "admin")) {
          const { password, id, bio, avatar } = req.body;
          // todo: Check if new user does not have more permissions than the current one!
          const user = new models.user({
            _id: id,
            password: encrypt(password),
            bio, avatar
          });
          user.isNew = true;
          user.save((error, data) => data ? $sendUser(res, data) : $send(res, { error, data }));
        } else {
          $send.missingPermission(res, "admin");
        }
      })
      .catch(error => $send(res, { error })));

  server.put("/api/user/:id", (req, res) =>
    async.all({
      session: getSessionUser(req),
      oldUser: getUser(req.params.id)
    }).then(({ session, oldUser }) => {
      if (!hasPermission(session, "admin")) return $send.missingPermission(res, "admin");
      const { password, bio, avatar, permissions } = req.body;
      // todo: Check if new user does not have more permissions than the current one!
      const user = new models.user({
        _id: req.params.id,
        password: password ? encrypt(password) : oldUser.password,
        permissions: permissions.reduce(
          (a, p) => allPermissions[p] && !a.includes(p) && p !== "admin" ? [...a, p] : a,
          oldUser.permissions.includes("admin") ? ["admin"] : []
        ),
        bio, avatar
      });
      user.isNew = false;
      user.save((error, data) => data ? $sendUser(res, data) : $send(res, { error, data }));
    }).catch(error => $send(res, { error })));

  server.get("/api/user-count", (req, res) =>
    models.user
      .count({})
      .exec((error, data) => $send(res, { error, data: { count: data } })));

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

  return {
    getSessionUser,
    hasPermission
  }
}

module.exports = {
  install, schema
}