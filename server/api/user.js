/*
 * Contains the user API operations for Helios like logging in
 */
const encryptWithSalt = require("../../utils/encrypt");
const escapeRegExp = require("../../utils/escapeRegExp");
const mongoose = require('mongoose');
const NotLoggedInError = require("../errors/NotLoggedInError");
const PermissionError = require("../errors/PermissionError");
const InvalidRequestError = require("../errors/InvalidRequestError");
const { error: DbError } = require("../db");
const { uploadFile, deleteFile } = require("./files");
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

const preinstall = ({ server }) => {
  // API specific middlemare
  server.use((req, res, next) => {
    // Get User & Session data
    req.user = {};
    req.user.getSession = () => req.session.helios || {};
    req.user.putSession = (values) => req.session.helios = { ...req.user.getSession(), ...values };
    req.user.maybeGetUser = () => req.user.getSession().userId ? User.findOne({ _id: req.user.getSession().userId }) : Promise.resolve(null);
    req.user.getUser = () => req.user.maybeGetUser().then(user => { if (user) return user; throw new NotLoggedInError(); });

    // Senders
    res.sendUser = (user) => Array.isArray(user)
      ? res.sendData({ data: user.map(filterUserData) })
      : res.sendData({ data: filterUserData(user) });

    next();
  });
}

const install = ({ server }) => {

  // todo: handle if no default user exists (is that even reasonable?)
  /*server.get("/api/user", (req, res) =>
    User.findOne({ _id: config.defaultUser.id })
      .then(user => res.sendUser(user))
      .catch(error => res.error.server(error)));*/

  server.get("/api/user/:id", (req, res) =>
    User.findOne({ _id: new RegExp("^" + escapeRegExp(req.params.id) + "$", "i") })
      .then(user => user ? res.sendUser(user) : res.error.notFound())
      .catch(error => res.error.server(error)));

  server.get("/api/users", (req, res) =>
    User.find({}).exec()
      .then(users => res.sendUser(users))
      .catch(error => res.error.server(error)))

  server.post("/api/user", async (req, res) => {
    try {
      const newUser = req.body;
      let logIn = false;
      // Check if we are creating the initial user.
      if (newUser.initialUser) {
        // The initial user can only be created if there are no other users.
        const count = await User.countDocuments().exec();
        if (count !== 0) {
          throw new PermissionError();
        }
        // Check if the given permissions are valid. The user may be an admin. And probably should be.
        if (!areValidPermissions(newUser.permissions, true)) {
          throw new InvalidRequestError({ permissions: newUser.permissions });
        }
        const session = await req.user.maybeGetUser();
        if (!session) {
          logIn = true;
        }
      } else {
        const session = await req.user.getUser();
        // Only the admin can create new users.
        if (!session.hasPermission(permissions.admin)) {
          throw new PermissionError(permissions.admin);
        }
        // Check if the given permissions are valid & that the created user is not an admin.
        if (!areValidPermissions(newUser.permissions, false)) {
          throw new InvalidRequestError({ permissions: newUser.permissions });
        }
      }
      // Check if we have an id.
      if (typeof newUser.id !== "string" || newUser.id.length === 0) {
        throw new InvalidRequestError({ id: newUser.id });
      }
      // Check if we have a password.
      if (typeof newUser.password !== "string" || newUser.password.length === 0) {
        throw new InvalidRequestError({ password: newUser.password });
      }
      const internal = await req.system.internal();
      // Create the user.
      let user = new User({
        _id: newUser.id,
        password: encryptWithSalt(newUser.password, internal.passwordSecret),
        permissions: newUser.permissions,
        bio: newUser.bio,
        avatar: newUser.avatar
      });

      user = await user.save();
      if (logIn) {
        req.user.putSession({ userId: user._id });
      }
      res.sendUser(user);
    } catch (error) {
      res.result(error);
    }
  });

  server.put("/api/user/:id", (req, res) =>
    Promise
      .all([req.user.getUser(), User.findOne({ _id: new RegExp("^" + escapeRegExp(req.params.id) + "$", "i") })])
      .then(async ([session, user]) => {
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
        const internal = await req.system.internal();
        // Update the user.
        user.password = newUser.password ? encryptWithSalt(newUser.password, internal.passwordSecret) : user.password;
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
      .then(async user => {
        const internal = await req.system.internal();
        if (!user || user.password !== encryptWithSalt(password, internal.passwordSecret)) {
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
        res.result(error);
      }));

  /**
   * Updates the user we are currently logged into.
   *
   * Permissions: none, must be logged in
   * Parameters: none
   * Body: { password: string, passwordNew: string, bio: string, avatar: string }
   */
  server.put("/api/session", async (req, res) => {
    try {
      let user = await req.user.getUser();
      // Check if the user confirmed the password
      const newUser = req.body;
      const internal = await req.system.internal();
      if (typeof newUser.password !== "string") {
        throw new InvalidRequestError({ password });
      }
      if (user.password !== encryptWithSalt(newUser.password, internal.passwordSecret)) {
        throw new AuthorizationError({ error: "Invalid password" });
      }
      // Update the user.
      if (newUser.passwordNew) {
        if (typeof newUser.passwordNew !== "string") {
          throw new InvalidRequestError({ passwordNew });
        }
        user.password = encryptWithSalt(newUser.passwordNew, internal.passwordSecret);
      }
      if (typeof newUser.avatar !== "string") {
        throw new InvalidRequestError({ avatar });
      }
      if (typeof newUser.bio !== "string") {
        throw new InvalidRequestError({ bio });
      }
      user.bio = newUser.bio;
      user.avatar = newUser.avatar;
      user = await user.save();
      res.sendUser(user);
    } catch (error) {
      res.result(error);
    }
  });

  server.get("/api/avatar/", async (req, res) => {
    try {
      const user = await req.user.getUser();
      if (user.avatar) {
        if (user.avatar.startsWith("data:")) {
          // Compatability for old avatars that were directly uploaded into the user doc.
          return res.blob(user.avatar);
        } else {
          return res.redirect(user.avatar);
        }
      } else {
        const settings = await req.system.config();
        return res.redirect(settings.defaultAvatar);
      }
    } catch (error) {
      return res.result(error);
    }
  });

  server.get("/api/avatar/:id", async (req, res) => {
    try {
      const user = await User.findOne({ _id: new RegExp("^" + escapeRegExp(req.params.id) + "$", "i") }).exec();
      if (!user) {
        return res.error.notFound();
      }
      if (user.avatar) {
        if (user.avatar.startsWith("data:")) {
          // Compatability for old avatars that were directly uploaded into the user doc.
          return res.blob(user.avatar);
        } else {
          return res.redirect(user.avatar);
        }
      } else {
        const settings = await req.system.config();
        return res.redirect(settings.defaultAvatar);
      }
    } catch (error) {
      return res.result(error);
    }
  });
}

// ===============================================
// === INTERNAL FUNCTIONS
// ===============================================
/*
// Create default content for the CMS if ot does not exist
const createFactoryContent = () => {
  if (config.defaultUser) {
    const { password, id } = config.defaultUser;
    const user = new User({
      _id: id,
      bio: "",
      avatar: "",
      password: e(password),
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
*/

// Misc operations
const filterUserData = ({ _id, avatar, bio, permissions }) => ({ id: _id, avatar, bio, permissions });

/**
 * Updates the avatat of the given user.
 * @param {{id: string, avatar: string}} detail The user ID and avatar to update.
 */
const updateAvatar = async ({ id, avatar }) => {
  await deleteFile(id + "-avatar");
  const file = await uploadFile({ id: id + "-avatar", name: id, path: ["user"], data: avatar });
  return file;
}

// ===============================================
// === EXPORTS
// ===============================================

module.exports = {
  install, preinstall
}
