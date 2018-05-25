const uuid = require("../../uuid");

const schema = ({ mongoose }) => {
  return mongoose.Schema({
    _id: String,
    author: String,
    title: Object,
    content: Object,
    date: Date
  });
}

const niceUri = text =>
  (("" + (text || uuid.uuidSection())) // Make sure we have a string! If not just shove a UUID in there.
    .replace(/[^a-zA-Z0-9]/g, '-')     // Replace non alphanumerical things with "-"
    .toLowerCase()                     // the internet is lowercase
    + "-" + uuid.uuidSection())        // Append a UUID to it, in case someone writes two posts with the same title
    .replace(/-+/g, "-");              // Avoid having URIs with multiple "-"s after another

const install = ({ server, models, $send }) => {
  // todo: introduce optional limit, etc.
  // https://stackoverflow.com/questions/5830513/how-do-i-limit-the-number-of-returned-items
  server.get("/api/post", (req, res) => {
    models.post.find({}, (error, data) => {
      $send(res, { error, data });
    });
  });

  server.post("/api/post", (req, res) => {
    const { title } = req.body;
    const post = new models.post({ ...req.body, _id: niceUri(title) });
    post.isNew = true;
    post.save((error, data) => {
      $send(res, { error, data })
    });
  });

  server.get("/api/post/:id", (req, res) => {
    // We use a reg exp to find the post to allow users to potentially omit the UUID from the URL.
    const idRegExp = new RegExp("^" + req.params.id);
    models.post.findOne({ _id: idRegExp }, (error, data) => {
      $send(res, { error, data });
    });
  });

  server.put("/api/post/:id", (req, res) => {
    const post = new models.post({ ...req.body, _id: req.params.id });
    post.isNew = false;
    post.save((error, data) => {
      $send(res, { error, data })
    });
  });

  server.delete("/api/post/:id", (req, res) => {
    models.post.remove({ _id: req.params.id }, (error, data) => {
      $send(res, { error, data });
    });
  });
}

module.exports = {
  install, schema
}