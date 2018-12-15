/*
 * Contains the user API operations for Helios like logging in
 */
const config = require("../../config/server");
const all = require("../../utils/all");
const encryptWithSalt = require("../../utils/encrypt");
const escapeRegExp = require("../../utils/escapeRegExp");
const mongoose = require('mongoose');
const { error: DbError } = require("../db");
const { mongoError } = require("../error-transformer");

// All permissions avilable.
const allPermissions = {
  // The admin can do everything.
  admin: "admin",
  // The author can publish, delete and edit posts.
  author: "author",
  // The maintainer can manage pages. 
  // TODO: Figure out a better name
  maintainer: "maintainer",
  // This person can manage community members.
  communityCanager: "community-manager"
};

// ===============================================
// === API FUNCTIONS
// ===============================================

const UserSchema = new mongoose.Schema({
  _id: String,
  bio: Object,
  avatar: String,
  password: String,
  permissions: [String]
});

/**
 * Checks if the user has the given permission.
 * @param permission The permission to check for.
 * @param impliedByAdmin Is the permission automatically granted by being admin? (true by default)
 */
UserSchema.methods.hasPermission = function (permission, impliedByAdmin = true) {
  if (this.permissions.includes(permission)) {
    return true;
  }
  if (impliedByAdmin && this.permissions.includes(allPermissions.admin)) {
    return true;
  }
  return false;
};

const User = mongoose.model("user", UserSchema);

const install = ({ server }) => {
  // API specific middlemare
  server.use((req, res, next) => {
    // Get User & Session data
    req.user = {};
    req.user.getSession = () => req.session.helios || {};
    req.user.putSession = (values) => req.session.helios = { ...req.user.getSession(), ...values };
    req.user.maybeGetUser = () => req.user.getSession().userId ? User.findOne({ _id: req.user.getSession().userId }) : Promise.resolve(null);
    req.user.getUser = () => req.user.maybeGetUser().then(user => { if (user) return user; throw "not-logged-in"; });

    // Senders
    res.sendUser = (user) => Array.isArray(user)
      ? res.sendData({ data: user.map(filterUserData) })
      : res.sendData({ data: filterUserData(user) });

    next();
  });

  // todo: handle if no default user exists (is that even reasonable?)
  server.get("/api/user", (req, res) =>
    User.findOne({ _id: config.defaultUser.id })
      .then(user => res.sendUser(user))
      .catch(error => res.error.server(error)));

  server.get("/api/user/:id", (req, res) =>
    User.findOne({ _id: new RegExp("^" + escapeRegExp(req.params.id) + "$", "i") })
      .then(user => user ? res.sendUser(user) : res.error.notFound())
      .catch(error => res.error.server(error)));

  server.get("/api/users", (req, res) =>
    User.find({}).exec()
      .then(users => res.sendUser(users))
      .catch(error => res.error.server(error)))

  server.post("/api/user", (req, res) =>
    req.user.getUser()
      .then(session => {
        if (!session.hasPermission("admin")) {
          return res.error.missingPermission("admin");
        }
        const { password, id, bio, avatar } = req.body;
        const user = new User({
          _id: id, // TODO: Permissions
          password: encrypt(password),
          bio, avatar
        });
        user.isNew = true;
        // TODO: Validate
        user.save()
          .then(user => res.sendUser(user))
          .catch(error => res.error.server(error));
      })
      .catch(error => res.sendData({ error })));

  server.put("/api/user/:id", (req, res) =>
    Promise
      .all([req.user.getUser(), User.findOne({ _id: new RegExp("^" + escapeRegExp(req.params.id) + "$", "i") })])
      .then(([session, oldUser]) => {
        if (!session.hasPermission("admin")) {
          return res.error.missingPermission("admin");
        }
        const { password, bio, avatar, permissions } = req.body;
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
        // TODO: Validate
        user.save()
          .then(user => res.sendUser(user))
          .catch(error => res.error.server(error));
      }).catch(error => res.error.server(error)));

  server.get("/api/user-count", (req, res) =>
    User.count({}).exec()
      .then(count => res.sendData({ data: { count } }))
      .catch(error => res.error.server(error)));

  server.post("/api/session/login", (req, res) => {
    // If the user is already logged in they cannot log in again.
    // A log out is required first.
    if (req.user.getSession().userId) {
      return res.error.authorizationFailure();
    }
    const { id, password } = req.body;
    User.findOne({ _id: new RegExp("^" + escapeRegExp(id) + "$", "i") })
      .then(user => {
        if (!user || user.password !== encrypt(password)) {
          return res.error.authorizationFailure();
        }
        req.user.putSession({ userId: id })
        res.sendUser(user);
      })
      .catch(error => {
        if (error.code === DbError.NoSuchKey) {
          res.error.authorizationFailure({ error, errorCode: 400 })
        } else {
          res.error.server(error);
        }
      });
  });

  server.post("/api/session/logout", (req, res) => {
    const oldUser = req.user.getSession().userId || null;
    req.user.putSession({ userId: null });
    res.sendData({ data: oldUser });
  });

  server.get("/api/session", (req, res) =>
    req.user.getUser()
      .then(user => res.sendUser(user))
      .catch(error => {
        if (error === "not-logged-in") {
          res.error.notLoggedIn();
        } else {
          res.error.server(error);
        }
      }));

  server.put("/api/session", (req, res) =>
    req.user.getUser()
      .then(user => {
        const { password } = req.body;
        if (user.password !== encrypt(password)) {
          return res.error.authorizationFailure();
        }
        const { passwordNew, avatar, bio } = req.body;
        const newModel = createUpdatedModel(user, { password: passwordNew, avatar, bio });
        newModel.save()
          .then(user => res.sendUser(user))
          .catch(error => res.error.server(error));
      })
      .catch(error => {
        if (error === "not-logged-in") {
          res.error.authorizationFailure();
        } else {
          res.error.server(error);
        }
      }));

  server.get("/api/avatar/:id", (req, res) =>
    User.findOne({ _id: new RegExp("^" + escapeRegExp(req.params.id) + "$", "i") })
      .then(user => user && user.avatar
        ? res.blob(user.avatar)
        : res.redirect("/static/content/system/default-avatar.png"))
      .catch(error => res.error.server(error)));

  createFactoryContent();
}

// ===============================================
// === INTERNAL FUNCTIONS
// ===============================================

// Create default content for the CMS if ot does not exist
const createFactoryContent = () => {
  if (config.defaultUser) {
    const { password, id } = config.defaultUser;
    const user = new User({
      _id: id,
      bio: "",
      avatar: "",
      password: encrypt(password),
      permissions: ["admin"]
    });
    user.isNew = true;
    user.save((error, data) => {
      if (error && error.code !== mongoError.duplicateKey) {
        console.error("Default user *not* created:", id, error);
      } else if (data) {
        console.log("Default user created:", id);
      }
    });
  }
}

const createUpdatedModel = (user, { password, avatar, permissions, bio }) => {
  const validPassword = password => password && ("string" === typeof password);
  // TODO: make sure the avatar is of the right image format. We don't want users to upload malware!
  const validAvatar = avatar => avatar && ("string" === typeof avatar) && avatar.length <= 200 * 1024;
  const validPermissions = permissions => permissions && Array.isArray(permissions) && all(permissions, p => allPermissions[p]);
  const validBio = () => true;

  const newUser = new User({
    _id: user._id,
    permissions: validPermissions(permissions) ? permissions : user.permissions,
    password: validPassword(password) ? encrypt(password) : user.password,
    bio: validBio(bio) ? bio : user.bio,
    avatar: validAvatar(avatar) ? avatar : user.avatar
  });
  newUser.isNew = false;
  return newUser;
}

// Misc operations
const filterUserData = ({ _id, avatar, bio, permissions }) => ({ id: _id, avatar, bio, permissions });
const encrypt = password => encryptWithSalt(password, config.passwordSecret);

// ===============================================
// === EXPORTS
// ===============================================

module.exports = {
  install
}
