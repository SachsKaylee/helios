const config = require("../../config/server");
const mongoose = require('mongoose');
const fs = require("fs-extra");
const path = require("path");
const niceUri = require("../../utils/nice-uri");
const blobExtract = require("../../utils/blob-extract");

/*
const Subscription = mongoose.model("subscription", new mongoose.Schema({
  _id: String,
  device: VersionDetails,
  os: VersionDetails,
  browser: VersionDetails,
  since: Date,
  // https://www.npmjs.com/package/web-push#usage
  subscription: {
    endpoint: String,
    keys: {
      auth: String,
      p256dh: String
    }
  }
}));
*/

const File = mongoose.model("file", new mongoose.Schema({
  _id: String,
  name: String,
  data: String,
  date: Date,
  path: [String]
}));
/*
for (let i = 0; i < 100; i++) {
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
}
*/
const install = ({ server }) => {
  // API specific middlemare
  server.use((req, res, next) => {
    // Get file data
    req.files = {};

    next();
  });

  server.post("/api/files/upload", async (req, res) => {
    try {
      const { path, source, files } = req.body;
      const split = path.split("/").filter(p => p);
      //console.log("/api/files/upload", { query: req.query, params: req.params, body: req.body, files: files });
      const data = await Promise.all(files.map(async data => {
        const content = await fs.readFile(data.path);
        console.log("Now uploading file ...", data);
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
      console.log("/api/files/browser", req.body)
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
      return res.blob(file.data);
    } catch (error) {
      return res.error.server(error);
    }
  });

  server.get("/api/files/thumb/:id", async (req, res) => {
    try {
      const file = await File.findById(req.params.id).select({ data: 1 }).exec();
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
  async permissions(req, res, { action, path, source }) {
    return res.sendData({
      data: {
        success: true,
        time: new Date().toISOString(),
        data: {
          messages: [],
          path: path,
          source: source,
          permissions: null
        }
      }
    });
  },
  /**
   * FOLDERS
   */
  async folders(req, res, { action, path, source }) {
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
              folders: split.length ? ["..", ...dirs] : dirs
            }
          }
        }
      }
    });
  },
  /**
   * FILES
   */
  async files(req, res, { action, path, source }) {
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
  async fileRemove(req, res, { action, path, source, name }) {
    const result = await File.findByIdAndDelete(name).exec();
    console.log("fileRmeove", result);
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

const isImage = base64 => base64.startsWith("data:image/");

module.exports = { install }
