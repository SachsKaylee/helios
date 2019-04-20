const mongoose = require('mongoose');
const fs = require("fs-extra");
const path = require("path");
const niceUri = require("../../utils/nice-uri");
const unqiue = require("../../utils/unqiue");
const blobExtract = require("../../utils/blob-extract");
const { permissions } = require("../../common/permissions");
const readdirRecursive = require("../../utils/readdir-recursive");
const mime = require("mime");
const PermissionError = require("../errors/PermissionError");
const InvalidRequestError = require("../errors/InvalidRequestError");

/**
 * This is the permission required to upload/delete/etc. files.
 */
const PERMISSION = permissions.file;

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

const preinstall = () => {
  const filesDir = path.resolve("./static/content/system");
  const files = readdirRecursive(filesDir);
  const promise = files.map(async filePath => {
    const name = path.basename(filePath);
    const id = niceUri(name, "system");
    let file = await File.findById(id);
    if (!file) {
      const absolutePath = path.join(filesDir, filePath);
      const fileBrowserPath = filePath.split("/");
      const extension = path.extname(name);
      fileBrowserPath.splice(0, 0, "system");
      fileBrowserPath.pop();
      let content = await fs.readFile(absolutePath, { encoding: "base64" });
      content = "data:" + mime.getType(extension) + ";base64," + content;
      file = new File({
        _id: id,
        name: name,
        path: fileBrowserPath,
        data: content,
        date: new Date()
      });
      await file.save();
    }
    return file;
  });
  return Promise.all(promise);
}

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
    const { path } = req.body;
    const split = path.split("/").filter(p => p);
    const user = await req.user.getUser();
    if (!isUserFolder(split, user.id) && !user.hasPermission(PERMISSION)) {
      throw new PermissionError(PERMISSION);
    }
    // Handle upload
    try {
      const { source, files: filesRaw } = req.body;
      // FIX: Files is sometimes an array, sometimes an object.
      const files = Object.values(filesRaw);
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
          time: new Date().getTime(),
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
      // RangeError [ERR_BUFFER_OUT_OF_BOUNDS]: Attempt to write outside buffer bounds
      // --> https://stackoverflow.com/questions/29918668/mongoerror-attempt-to-write-outside-buffer-bounds
      //     https://docs.mongodb.com/manual/reference/limits/
      return res.result(error);
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
      if (error instanceof Error) {
        res.result(error);
      } else {
        // TODO: Fully get rid of me by using Error Objects for errors.
        return res.error.server(error);
      }
    }
  });

  /**
   * Serves the given file.
   */
  server.get("/api/files/serve/:id", async (req, res) => {
    try {
      const file = await File.findById(req.params.id).select({ data: 1 }).exec();
      if (file) {
        const accept = req.header("accept");
        switch (accept) {
          case "text/plain": {
            return res.status(200).contentType("text/plain").send(file.data);
          }
          default: {
            return res.blob(file.data);
          }
        }
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

const handleAction = {
  /**
   * PERMISSIONS
   */
  async permissions(req, res, { path, source }) {
    const split = path.split("/").filter(p => p);
    const user = await req.user.maybeGetUser();
    // Are we just a normal user, or a file manager for all files.
    const isUser = !!user;
    const isFileManager = !!(user && user.hasPermission(PERMISSION));
    // Get the permissions.
    const basicPermission = isUser;
    const advancedPermission = isUser && (isFileManager || isUserFolder(split, user && user.id));
    // Reply.
    return res.sendData({
      data: {
        success: true,
        time: new Date().getTime(),
        data: {
          messages: [],
          path: path,
          source: source,
          permissions: {
            allowFiles: basicPermission,
            allowFileMove: advancedPermission,
            allowFileUpload: advancedPermission,
            allowFileUploadRemote: advancedPermission,
            allowFileRemove: advancedPermission,
            allowFileRename: advancedPermission,
            allowFolders: basicPermission,
            allowFolderMove: advancedPermission,
            allowFolderCreate: advancedPermission,
            allowFolderRemove: advancedPermission,
            allowFolderRename: advancedPermission,
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
    const user = await req.user.getUser();
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
    // Get special fodlers
    const specialFolders = [];
    if (split.length !== 0) {
      specialFolders.push("..")
    }
    if (split.length === 1 && split[0] === "user") {
      specialFolders.push(user.id);
    }
    // Reply
    return res.sendData({
      data: {
        success: true,
        time: new Date().getTime(),
        data: {
          messages: [],
          sources: {
            [source]: {
              path: path,
              baseurl: "/api/files/serve/",
              folders: unqiue([...specialFolders, ...dirs, ...readTempFolders(split)])
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
    await req.user.getUser();
    const split = path.split("/").filter(p => p);
    const files = await File.find({ path: split }).exec();
    return res.sendData({
      data: {
        success: true,
        time: new Date().getTime(),
        data: {
          messages: [],
          sources: {
            [source]: {
              path: path,
              baseurl: "/api/files/serve/",
              files: files.map(file => ({
                file: "/api/files/serve/" + file._id,
                fileIsAbsolute: true,
                thumb: "/api/files/thumb/" + file._id,
                thumbIsAbsolute: true,
                changed: file.date.getTime(),
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
    const split = path.split("/").filter(p => p);
    const user = await req.user.getUser();
    if (!isUserFolder(split, user.id) && !user.hasPermission(PERMISSION)) {
      throw new PermissionError(PERMISSION);
    }
    await File.findByIdAndDelete(name).exec();
    deleteTempFolder(split);
    return res.sendData({
      data: {
        success: true,
        time: new Date().getTime(),
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
    const split = path.split("/").filter(p => p);
    const user = await req.user.getUser();
    if (!isUserFolder(split, user.id) && !user.hasPermission(PERMISSION)) {
      throw new PermissionError(PERMISSION);
    }
    if (split.length === 0) {
      throw new InvalidRequestError("Cannot delete root folder");
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
        time: new Date().getTime(),
        data: {
          messages: []
        }
      }
    });
  },
  async folderCreate(req, res, { path, source, name }) {
    const split = [...path.split("/").filter(p => p), name];
    const user = await req.user.getUser();
    if (!isUserFolder(split, user.id) && !user.hasPermission(PERMISSION)) {
      throw new PermissionError(PERMISSION);
    }
    createTempFolder(split);
    return res.sendData({
      data: {
        success: true,
        time: new Date().getTime(),
        data: {
          messages: []
        }
      }
    });
  }
}

/**
 * Checks if the given path is a user folder.
 * @param {string[]} path The path.
 * @param {string} userName The name of the user.
 */
const isUserFolder = (path, userName) => {
  if (path.length < 2) return false;
  if (path[0] !== "user") return false;
  if (path[1] !== userName) return false;
  return true;
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
 * Deletes the file with the given ID.
 * @param {string} id The file ID.
 */
const deleteFile = (id) => File.findByIdAndDelete(id);

/**
 * Uploads a file.
 * @param {{id: string, name: string, path: string[], data: string}} file The file data.
 */
const uploadFile = ({ id, name, path, data }) => {
  const file = new File({
    _id: id,
    name: name,
    path: path,
    data: data,
    date: new Date()
  });
  return file.save();
}

/**
 * Checks if the given blob is an image blob.
 * @param {string} blob The blob.
 */
const isImage = blob => blob.startsWith("data:image/");

module.exports = { preinstall, install, uploadFile, deleteFile }
