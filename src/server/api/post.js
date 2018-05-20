const lorem = require("lorem-ipsum");
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

const install = ({ server, models, send }) => {
  // todo: introduce optional limit, etc.
  // https://stackoverflow.com/questions/5830513/how-do-i-limit-the-number-of-returned-items
  server.get("/api/post", (req, res) => {
    models.post.find({}, (error, data) => {
      send(res, { error, data });
    });
  });

  server.post("/api/post", (req, res) => {
    const post = new models.post({ ...req.body, _id: uuid() });
    post.isNew = true;
    post.save((error, data) => {
      send(res, { error, data })
    });
  });

  server.get("/api/post/:id", (req, res) => {
    models.post.findOne({ _id: req.params.id }, (error, data) => {
      send(res, { error, data });
    });
  });

  server.put("/api/post/:id", (req, res) => {
    const post = new models.post({ ...req.body, _id: req.params.id });
    post.isNew = false;
    post.save((error, data) => {
      send(res, { error, data })
    });
  });

  server.delete("/api/post/:id", (req, res) => {
    models.post.remove({ _id: req.params.id }, (error, data) => {
      send(res, { error, data });
    });
  });
}

module.exports = {
  install, schema
}