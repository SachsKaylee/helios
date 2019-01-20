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
const { permissions, areValidPermissions } = require("../../common/permissions");

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
 * @param {string} permission The permission to check for.
 * @param {boolean} impliedByAdmin Is the permission automatically granted by being admin? (true by default)
 */
UserSchema.methods.hasPermission = function (permission, impliedByAdmin = true) {
  if (this.permissions.includes(permission)) {
    return true;
  }
  if (impliedByAdmin && this.permissions.includes(permissions.admin)) {
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
        // Only the admin can create new users.
        if (!session.hasPermission(permissions.admin)) {
          return res.error.missingPermission(permissions.admin);
        }
        // Check if the given permissions are valid & that the created user is not an admin.
        const newUser = req.body;
        if (!areValidPermissions(newUser.permissions, false)) {
          return res.error.invalidRequest();
        }
        // Check if we have a password.
        if (!newUser.password) {
          return res.error.invalidRequest();
        }
        // Create the user.
        const user = new User({
          _id: newUser.id,
          password: encrypt(newUser.password),
          permissions: newUser.permissions,
          bio: newUser.bio,
          avatar: newUser.avatar
        });
        /*user.isNew = true;*/
        return user.save().then(user => res.sendUser(user));
      })
      .catch(error => res.sendData({ error })));

  server.put("/api/user/:id", (req, res) =>
    Promise
      .all([req.user.getUser(), User.findOne({ _id: new RegExp("^" + escapeRegExp(req.params.id) + "$", "i") })])
      .then(([session, user]) => {
        // Only the admin may update users.
        // Users update themselves through their session handler.
        if (!session.hasPermission(permissions.admin)) {
          return res.error.missingPermission(permissions.admin);
        }
        // Check if the given permissions are valid. e.g. there than only be one admin.
        const newUser = req.body;
        const wasAdmin = user.hasPermission(permissions.admin);
        if (!areValidPermissions(newUser.permissions, wasAdmin)) {
          return res.error.invalidRequest();
        }
        // Update the user.
        user.password = newUser.password ? encrypt(newUser.password) : user.password;
        user.permissions = newUser.permissions;
        user.bio = newUser.bio;
        user.avatar = newUser.avatar;
        return user.save().then(user => res.sendUser(user));
      })
      .catch(error => res.error.server(error)));

  server.get("/api/user-count", (req, res) =>
    User.countDocuments().exec()
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
        // Check if the user confirmed the password
        const newUser = req.body;
        if (newUser.password !== encrypt(password)) {
          return res.error.authorizationFailure();
        }
        // Update the user.
        if (newUser.passwordNew) {
          user.password = encrypt(newUser.passwordNew)
        }
        user.avatar = newUser.avatar;
        user.bio = newUser.bio;
        return user.save().then(user => res.sendUser(user))
      })
      .catch(error => {
        if (error === "not-logged-in") {
          res.error.authorizationFailure();
        } else {
          res.error.server(error);
        }
      }));

  server.get("/api/avatar/", (req, res) =>
    req.user.getUser()
      .then(user => user && user.avatar
        ? res.blob(user.avatar)
        : res.redirect("/static/content/system/default-avatar.png"))
      .catch(error => res.error.server(error)));

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
      permissions: [permissions.admin]
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

// Misc operations
const filterUserData = ({ _id, avatar, bio, permissions }) => ({ id: _id, avatar, bio, permissions });
const encrypt = password => encryptWithSalt(password, config.passwordSecret);

// ===============================================
// === EXPORTS
// ===============================================

module.exports = {
  install
}
