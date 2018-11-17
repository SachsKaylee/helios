const config = require("../../config/server");
const niceUri = require("../../nice-uri");
const mongoose = require('mongoose');

const intOr = (int, or) => Number.isInteger(int) ? int : or;
const stringOr = (string, or) => ("string" === typeof string) ? string : or;

const Post = mongoose.model("post", new mongoose.Schema({
  _id: String,
  author: String,
  title: Object,
  content: Object,
  date: Date,
  tags: [String],
  notes: String
}));

const install = ({ server, models, api }) => {
  // https://stackoverflow.com/questions/5830513/how-do-i-limit-the-number-of-returned-items
  server.get("/api/post", (req, res) =>
    Post
      .find({})
      .sort({ date: "descending" })
      .skip(intOr(parseInt(req.query.skip), 0)) // TODO: skip has poor performance on large collection
      .limit(intOr(parseInt(req.query.limit), undefined))
      .then(posts => res.sendData({ data: posts }))
      .catch(error => res.error.server(error)));

  server.post("/api/post", (req, res) =>
    req.user.getUser()
      .then(user => {
        if (!user.hasPermission("author")) {
          return res.error.missingPermission("author");
        }
        const { title } = req.body;
        const post = new models.post({ ...req.body, _id: niceUri(title) });
        post.isNew = true;
        return post.save().then(post => res.sendData({ data: post }))
      })
      .catch(error => {
        if (error === "not-logged-in") {
          res.error.notLoggedIn();
        } else {
          res.error.server(error);
        }
      }));

  server.get("/api/post/:id", (req, res) => {
    // We use a reg exp to find the post to allow users to potentially omit the UUID from the URL.
    const idRegExp = new RegExp("^" + req.params.id);
    Post
      .findOne({ _id: idRegExp })
      .then(post => res.sendData({ data: post }))
      .catch(error => res.error.server(error));
  });

  server.put("/api/post/:id", (req, res) =>
    req.user.getUser()
      .then(user => {
        if (!user.hasPermission("author")) {
          return res.error.missingPermission("author");
        }
        const post = new Post({ ...req.body, _id: req.params.id });
        post.isNew = false;
        // TODO: Validate Post
        return post.save().then(post => res.sendData({ data: post }));
      })
      .catch(error => {
        if (error === "not-logged-in") {
          res.error.notLoggedIn();
        } else {
          res.error.server(error);
        }
      }));

  server.delete("/api/post/:id", (req, res) =>
    Post
      .remove({ _id: req.params.id })
      .then(post => res.sendData({ data: post }))
      .catch(error => res.error.server(error)));

  server.get("/api/post-count", (req, res) =>
    Post
      .count({})
      .exec()
      .then(count => res.sendData({ data: { count } }))
      .catch(error => res.error.server(error)));

  server.get("/api/posts-of", (req, res) =>
    Post
      .find({ author: config.defaultUser.id })
      .sort({ date: "descending" })
      .skip(intOr(parseInt(req.query.skip), 0)) // todo: skip has poor performance on large collection
      .limit(intOr(parseInt(req.query.limit), undefined))
      .exec()
      .then(posts => res.sendData({ data: posts }))
      .catch(error => res.error.server(error)));

  server.get("/api/posts-of/:id", (req, res) =>
    Post
      .find({ author: req.params.id })
      .sort({ date: "descending" })
      .skip(intOr(parseInt(req.query.skip), 0)) // todo: skip has poor performance on large collection
      .limit(intOr(parseInt(req.query.limit), undefined))
      .exec()
      .then(posts => res.sendData({ data: posts }))
      .catch(error => res.error.server(error)));
}

module.exports = {
  install, schema
}
