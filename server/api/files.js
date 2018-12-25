const config = require("../../config/server");
const mongoose = require('mongoose');
const fs = require("fs-extra");
const path = require("path");
const niceUri = require("../../utils/nice-uri");
const unqiue = require("../../utils/unqiue");
const blobExtract = require("../../utils/blob-extract");

/**
 * This is the permission required to upload/delete/etc. files.
 */
const PERMISSION = "files";

const File = mongoose.model("file", new mongoose.Schema({
  _id: String,
  name: String,
  data: String,
  date: Date,
  path: [String]
}));

/*for (let i = 0; i < 100; i++) {
  const name = lorem({ units: "words", count: random.integer(2, 4) });
  const id = niceUri(name);
  const date = new Date(random.integer(2000, 2018), random.integer(1, 12), random.integer(1, 28), random.integer(1, 23), random.integer(1, 59), random.integer(0, 59), 0);
  const path = new Array(random.integer(0, 4));
  for(let j = 0; j < path.length; j++) {
    path[j] = "folder-" + random.integer(1, 3);
  }
  const file = new File({
    _id: id, name, date, path,
    data: theFile.data
  });
  file.save();
}*/

const install = ({ server }) => {
  // API specific middlemare
  server.use((req, res, next) => {
    // Get file data
    req.files = {};

    next();
  });

  /**
   * Uploads the given file.
   */
  server.post("/api/files/upload", async (req, res) => {
    // Check permissions
    if (!await checkPermission(req, res)) {
      return;
    }
    // Handle upload
    try {
      const { path, source, files } = req.body;
      const split = path.split("/").filter(p => p);
      const data = await Promise.all(files.map(async data => {
        const content = await fs.readFile(data.path);
        const file = new File({
          _id: niceUri(data.originalFilename),
          name: data.originalFilename,
          path: split,
          data: "data:" + data.type + ";base64," + content.toString("base64"),
          date: new Date()
        });
        return await file.save();
      }));
      return res.sendData({
        data: {
          success: true,
          time: new Date().toISOString(),
          data: {
            messages: [],
            files: data.map(file => file._id),
            isImages: data.map(file => isImage(file.data)),
            baseurl: "/api/files/serve/",
            //newfilename: "my-newfilename"
          }
        }
      });
    } catch (error) {
      return res.error.server(error);
    }
  });

  /**
   * Gets the file browser content.
   */
  server.post("/api/files/browser", (req, res) => {
    try {
      const handler = handleAction[req.body.action];
      if (handler === undefined) {
        return res.sendData({ error: req.body.action, errorCode: 501 });
      } else {
        return handler(req, res, req.body);
      }
    } catch (error) {
      return res.error.server(error);
    }
  });

  /**
   * Serves the given file.
   */
  server.get("/api/files/serve/:id", async (req, res) => {
    try {
      const file = await File.findById(req.params.id).select({ data: 1 }).exec();
      if (file) {
        return res.blob(file.data);
      } else {
        return res.error.notFound();
      }
    } catch (error) {
      return res.error.server(error);
    }
  });

  /**
   * Serves the thumbnail of the given file.
   */
  server.get("/api/files/thumb/:id", async (req, res) => {
    try {
      const file = await File.findById(req.params.id).select({ data: 1 }).exec();
      if (!file) {
        return res.error.notFound();
      }
      if (isImage(file.data)) {
        return res.blob(file.data);
      } else {
        const { mime } = blobExtract(file.data);
        const fsMime = mime.replace("/", "-") + ".png";
        if (await fs.exists(path.resolve("./static/thumbs", fsMime))) {
          res.redirect("/static/thumbs/" + fsMime)
        } else {
          console.log("Failed looking for mime thumbnail:", fsMime);
          res.redirect("/static/thumbs/default.png")
        }
      }
    } catch (error) {
      return res.error.server(error);
    }
  });
}

/**
 * Checks if the requesting user has the required permission. Also answers the request.
 * @returns {boolean} true it the user has the permission, false otherwise(or on error).
 */
const checkPermission = async (req, res) => {
  // Check permissions
  try {
    const user = await req.user.getUser();
    if (!user.hasPermission(PERMISSION)) {
      res && res.error.missingPermission(PERMISSION);
      return false;
    }
  } catch (error) {
    if (error === "not-logged-in") {
      res && res.error.notLoggedIn();
      return false;
    }
    res && res.error.server(error);
    return false;
  }
  return true;
}

const handleAction = {
  /**
   * PERMISSIONS
   */
  async permissions(req, res, { path, source }) {
    const user = await req.user.maybeGetUser();
    const isUser = !!user;
    const isFileManager = !!(user && user.hasPermission(PERMISSION));
    return res.sendData({
      data: {
        success: true,
        time: new Date().toISOString(),
        data: {
          messages: [],
          path: path,
          source: source,
          permissions: {
            allowFiles: isUser,
            allowFileMove: isFileManager,
            allowFileUpload: isFileManager,
            allowFileUploadRemote: isFileManager,
            allowFileRemove: isFileManager,
            allowFileRename: isFileManager,
            allowFolders: isUser,
            allowFolderMove: isFileManager,
            allowFolderCreate: isFileManager,
            allowFolderRemove: isFileManager,
            allowFolderRename: isFileManager,
            allowImageResize: false,
            allowImageCrop: false,
          }
        }
      }
    });
  },
  /**
   * FOLDERS
   */
  async folders(req, res, { path, source }) {
    if (!await req.user.maybeGetUser()) {
      return res.error.notLoggedIn();
    }
    // Create a query that will find all files in subfolders.
    const split = path.split("/").filter(p => p);
    const query = split.reduce((acc, ele, i) => ({ ...acc, ["path." + i]: ele }), {});
    query["path." + split.length] = { $exists: true }
    const files = await File.find(query).select({ path: 1 }).exec();
    // Get all direct subfolders
    const dirs = Array.from(files.reduce((set, file) => {
      set.add(file.path[split.length]);
      return set;
    }, new Set()));
    // Reply
    return res.sendData({
      data: {
        success: true,
        time: new Date().toISOString(),
        data: {
          messages: [],
          sources: {
            [source]: {
              path: path,
              baseurl: "/api/files/serve/",
              folders: unqiue(split.length ? ["..", ...dirs, ...readTempFolders(split)] : [...dirs, ...readTempFolders(split)])
            }
          }
        }
      }
    });
  },
  /**
   * FILES
   */
  async files(req, res, { path, source }) {
    if (!await req.user.maybeGetUser()) {
      return res.error.notLoggedIn();
    }
    const split = path.split("/").filter(p => p);
    const files = await File.find({ path: split }).exec();
    return res.sendData({
      data: {
        success: true,
        time: new Date().toISOString(),
        data: {
          messages: [],
          sources: {
            [source]: {
              path: path,
              baseurl: "/api/files/serve/",
              files: files.map(file => ({
                file: file._id,
                thumb: "/api/files/thumb/" + file._id,
                thumbIsAbsolute: true,
                changed: file.date.toISOString(),
                size: file.data.length,
                isImage: isImage(file.data)
              }))
            }
          }
        }
      }
    });
  },
  /**
   * FILE REMOVE
   */
  async fileRemove(req, res, { path, source, name }) {
    if (!await checkPermission(req, res)) {
      return;
    }
    const split = path.split("/").filter(p => p);
    await File.findByIdAndDelete(name).exec();
    deleteTempFolder(split);
    return res.sendData({
      data: {
        success: true,
        time: new Date().toISOString(),
        data: {
          messages: []
        }
      }
    });
  },
  /**
   * FOLDER REMOVE
   */
  async folderRemove(req, res, { path, source }) {
    if (!await checkPermission(req, res)) {
      return;
    }
    const split = path.split("/").filter(p => p);
    if (split.length === 0) {
      return res.sendData({
        error: "root",
        errorCode: 403
      });
    }
    // What was removed? & Get the folder old files will be moved to
    const newPath = split.slice(0, -1);
    const deleted = split[split.length - 1];
    // Find affected files
    const query = split.reduce((acc, ele, i) => ({ ...acc, ["path." + i]: ele }), {});
    const files = await File.find(query).exec();
    // Move the files
    await Promise.all(files.map(async file => {
      file.path = newPath;
      file.name = deleted + " - " + file.name;
      await file.save();
    }));
    deleteTempFolder(split);
    // Done
    return res.sendData({
      data: {
        success: true,
        time: new Date().toISOString(),
        data: {
          messages: []
        }
      }
    });
  },
  async folderCreate(req, res, { path, source, name }) {
    if (!await checkPermission(req, res)) {
      return;
    }
    const split = [...path.split("/").filter(p => p), name];
    createTempFolder(split);
    return res.sendData({
      data: {
        success: true,
        time: new Date().toISOString(),
        data: {
          messages: []
        }
      }
    });
  }
}

/**
 * The current temporary folders. This value mutates!
 */
const tempFolders = {};

/**
 * Gets all temporary folders at the given path.
 * @param {string[]} path The path to look for.
 */
const readTempFolders = path => {
  let folder = tempFolders;
  for (let i = 0; i < path.length; i++) {
    const element = path[i];
    folder = folder[element];
    if (!folder) {
      break;
    }
  }
  return folder ? Object.keys(folder) : [];
}

/**
 * Creates a temporary folder.
 * @param {string[]} path The path to create
 */
const createTempFolder = path => {
  let folder = tempFolders;
  for (let i = 0; i < path.length; i++) {
    const element = path[i];
    let thisFolder = folder[element];
    if (!thisFolder) {
      folder[element] = thisFolder = {};
    }
    folder = thisFolder;
  }
  return tempFolders;
}

/**
 * Deletes a temporary folder.
 * @param {string[]} path The path to delete
 */
const deleteTempFolder = path => {
  let folder = tempFolders;
  for (let i = 0; i < path.length - 1; i++) {
    const element = path[i];
    folder = folder[element];
    if (!folder) {
      break;
    }
  }
  if (folder) {
    delete folder[path[path.length - 1]];
  }
  return tempFolders;
}

/**
 * Checks if the given blob is an image blob.
 * @param {string} blob The blob.
 */
const isImage = blob => blob.startsWith("data:image/");

module.exports = { install }
