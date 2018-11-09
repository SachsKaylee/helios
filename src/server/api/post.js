const uuid = require("../../uuid");
const config = require("../../config/server");

const intOr = (int, or) => Number.isInteger(int) ? int : or;
const stringOr = (string, or) => ("string" === typeof string) ? string : or;

const schema = ({ mongoose }) => {
  return mongoose.Schema({
    _id: String,
    author: String,
    title: Object,
    content: Object,
    date: Date,
    tags: [String],
    notes: String
  });
}

const niceUri = text =>
  (("" + (text || uuid.uuidSection())) // Make sure we have a string! If not just shove a UUID in there.
    .replace(/[^a-zA-Z0-9]/g, '-')     // Replace non alphanumerical things with "-"
    .toLowerCase()                     // the internet is lowercase
    + "-" + uuid.uuidSection())        // Append a UUID to it, in case someone writes two posts with the same title
    .replace(/-+/g, "-");              // Avoid having URIs with multiple "-"s after another

const install = ({ server, models, api }) => {
  // https://stackoverflow.com/questions/5830513/how-do-i-limit-the-number-of-returned-items
  server.get("/api/post", (req, res) =>
    models.post
      .find({})
      .sort({ date: "descending" })
      .skip(intOr(parseInt(req.query.skip), 0)) // todo: skip has poor performance on large collection
      .limit(intOr(parseInt(req.query.limit), undefined))
      .exec((error, data) => res.sendData({ error, data })));

  server.post("/api/post", (req, res) =>
    api.user.getSessionUser(req)
      .then(user => {
        if (!api.user.hasPermission(user, "author")) {
          return res.error.missingPermission("author");
        }
        const { title } = req.body;
        const post = new models.post({ ...req.body, _id: niceUri(title) });
        post.isNew = true;
        post.save((error, data) => res.sendData({ error, data }));
      })
      .catch(error => res.sendData({ error })));

  server.get("/api/post/:id", (req, res) => {
    // We use a reg exp to find the post to allow users to potentially omit the UUID from the URL.
    const idRegExp = new RegExp("^" + req.params.id);
    models.post.findOne({ _id: idRegExp }, (error, data) => {
      res.sendData({ error, data });
    });
  });

  server.put("/api/post/:id", (req, res) =>
    api.user.getSessionUser(req)
      .then(user => {
        if (!api.user.hasPermission(user, "author")) {
          return res.error.missingPermission("author");
        }
        const post = new models.post({ ...req.body, _id: req.params.id });
        post.isNew = false;
        post.save((error, data) => res.sendData({ error, data }));
      })
      .catch(error => res.sendData({ error })));

  server.delete("/api/post/:id", (req, res) => 
    models.post.remove({ _id: req.params.id }, (error, data) => {
      res.sendData({ error, data });
    }));

  server.get("/api/post-count", (req, res) =>
    models.post
      .count({})
      .exec((error, data) => res.sendData({ error, data: { count: data } })));

  server.get("/api/posts-of", (req, res) =>
    models.post
      .find({ author: config.defaultUser.id })
      .sort({ date: "descending" })
      .skip(intOr(parseInt(req.query.skip), 0)) // todo: skip has poor performance on large collection
      .limit(intOr(parseInt(req.query.limit), undefined))
      .exec((error, data) => res.sendData({ error, data })));

  server.get("/api/posts-of/:id", (req, res) =>
    models.post
      .find({ author: req.params.id })
      .sort({ date: "descending" })
      .skip(intOr(parseInt(req.query.skip), 0)) // todo: skip has poor performance on large collection
      .limit(intOr(parseInt(req.query.limit), undefined))
      .exec((error, data) => res.sendData({ error, data })));
}

module.exports = {
  install, schema
}