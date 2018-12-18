const config = require("../../config/server");
const mongoose = require('mongoose');
const lorem = require("lorem-ipsum");
const niceUri = require("../../utils/nice-uri");
const random = require("../../utils/random");
const theFile = require("./thefile.json");

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

  /**
   * Gets the VAPID public key of this server.
   */
  server.post("/api/files/browser", (req, res) => {
    try {
      const { action, path, source } = req.body;
      const handler = handleAction[action];
      console.log("/api/files/browser", { action, path, source, handler: handler !== undefined })
      if (handler === undefined) {
        return res.error.server({ action, path, source, handler: handler && handler.toString() });
      } else {
        return handler(req, res, { action, path, source });
      }
    } catch (error) {
      return res.error.server(error);
    }
  });

  /**
   * Serves the given file.
   */
  server.get("/api/files/serve/*", async (req, res) => {
    try {
      const params = req.params[0].split("/");
      const id = params[params.length - 1];
      const file = await File.findById(id).select({ data: 1 }).exec();
      return res.blob(file.data);
    } catch (error) {
      return res.error.server(error);
    }
  });
}

const handleAction = {
  async permissions(req, res, { action, path, source }) {
    return res.sendData({
      data: {
        success: true,
        time: new Date().toISOString(),
        data: {
          path: path,
          source: source,
          permissions: null
        }
      }
    });
  },
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
              folders: [
                path !== "/" ? "/" : "root",
                ...dirs
              ]
            }
          },
          code: 666,
          path: "value-of-path",
          name: "value-of-name",
          source: "value-of-source",
          permissions: null
        }
      }
    });
  },
  async files(req, res, { action, path, source }) {
    const split = path.split("/").filter(p => p);
    const files = await File.find({ path: split }).exec();

    return res.sendData({
      data: {
        success: true,
        time: new Date().toISOString(),
        data: {
          //messages: [],
          sources: {
            [source]: {
              path: path,
              baseurl: "/api/files/serve/",
              files: files.map(file => ({
                file: file._id,
                thumb: file._id,
                changed: file.date.toISOString(),
                size: file.data.length,
                isImage: file.data.startsWith("data:image/")
              }))
              /*[
                {
                  file: "my-document-1.txt",
                  thumb: "txt.png",
                  changed: new Date().toISOString(),
                  size: "789",
                  isImage: false
                },
                {
                  file: "my-document-2.txt",
                  thumb: "txt.png",
                  changed: new Date().toISOString(),
                  size: "562",
                  isImage: false
                },
                {
                  file: "my-image-1.png",
                  thumb: "my-image-1.png",
                  changed: new Date().toISOString(),
                  size: "2003",
                  isImage: true
                },
                {
                  file: "my-image-2.gif",
                  thumb: "my-image-2.gif",
                  changed: new Date().toISOString(),
                  size: "142",
                  isImage: true
                }
              ]*//*,
              folders: [
                "filesmy-dir-1",
                "filesmy-dir-2"
              ]*/
            }
          },
          /*code: 666,
          path: path,
          name: "filesvalue-of-name",
          source: source,
          permissions: null*/
        }
      }
    });
  },

}

module.exports = { install }
