const config = require("../../config/server");
const niceUri = require("../../utils/nice-uri");
const mongoose = require('mongoose');

const intOr = (int, or) => Number.isInteger(int) ? int : or;
const stringOr = (string, or) => ("string" === typeof string) ? string : or;

const Page = mongoose.model("page", new mongoose.Schema({
  _id: String,
  title: String,
  elements: [Object],
  path: [String],
  notes: String
}));

const install = ({ server }) => {
  // https://stackoverflow.com/questions/5830513/how-do-i-limit-the-number-of-returned-items
  server.get("/api/page", (req, res) =>
    Page
      .find({})
      .sort({ title: "ascending" })
      .skip(intOr(parseInt(req.query.skip), 0)) // TODO: skip has poor performance on large collection
      .limit(intOr(parseInt(req.query.limit), undefined))
      .then(pages => res.sendData({ data: pages }))
      .catch(error => res.error.server(error)));

  server.post("/api/page", (req, res) =>
    req.user.getUser()
      .then(user => {
        if (!user.hasPermission("maintainer")) {
          return res.error.missingPermission("maintainer");
        }
        const { title } = req.body;
        const page = new Page({ ...req.body, _id: niceUri(title) });
        page.isNew = true;
        return page.save().then(page => res.sendData({ data: page }))
      })
      .catch(error => {
        if (error === "not-logged-in") {
          res.error.notLoggedIn();
        } else {
          res.error.server(error);
        }
      }));

  server.get("/api/page/:id", (req, res) => {
    // We use a reg exp to find the page to allow users to potentially omit the UUID from the URL.
    // TODO: Escape ID for RegExp
    const idRegExp = new RegExp("^" + req.params.id);
    Page
      .findOne({ _id: idRegExp })
      .then(page => res.sendData({ data: page }))
      .catch(error => res.error.server(error));
  });

  server.put("/api/page/:id", (req, res) =>
    req.user.getUser()
      .then(user => {
        if (!user.hasPermission("maintainer")) {
          return res.error.missingPermission("maintainer");
        }
        const page = new Page({ ...req.body, _id: req.params.id });
        page.isNew = false;
        // TODO: Validate Page
        return page.save().then(page => res.sendData({ data: page }));
      })
      .catch(error => {
        if (error === "not-logged-in") {
          res.error.notLoggedIn();
        } else {
          res.error.server(error);
        }
      }));

  server.delete("/api/page/:id", (req, res) =>
    Page
      .deleteOne({ _id: req.params.id })
      .then(page => res.sendData({ data: page }))
      .catch(error => res.error.server(error)));

  server.get("/api/page-paths", (req, res) =>
    Page
      .distinct("path")
      .exec()
      .then(paths => res.sendData({ data: { paths } }))
      .catch(error => res.error.server(error)));

  server.get("/api/page-count", (req, res) =>
    Page
      .count({})
      .exec()
      .then(count => res.sendData({ data: { count } }))
      .catch(error => res.error.server(error)));

  server.get("/api/page-navigation", (req, res) =>
    Page
      .find({})
      .exec()
      .then(pages => {
        const navigation = pages.reduce((navigation, page) => {
          const { _id, title, path } = page;
          // Create the containing folder
          let navigationNode = navigation;
          for (let i = 0; i < path.length; i++) {
            let child = navigationNode.children.find(child => child.title === path[i]);
            // Create folder path if it does not exist. Flag navigation nodes that are just folders as "synthetic"
            if (!child) {
              child = {
                title: path[i],
                id: "page/" + path[i],
                link: null,
                children: [],
                isSynthetic: true
              };
              navigationNode.children.push(child);
            }
            navigationNode = child;
          }
          // Create the actual link
          let node = navigationNode.children.find(child => child.title === title);
          if (!node) {
            node = {
              title: title,
              id: "page/" + _id,
              link: "/page/" + _id,
              children: [],
              isSynthetic: false
            }
            navigationNode.children.push(node);
          } else if (node.isSynthetic) {
            node.title = title;
            node.link = "/page/" + _id;
            node.isSynthetic = false;
          }
          return navigation;
        }, { children: [] });
        res.sendData({ data: navigation.children });
      })
      .catch(error => res.error.server(error)));
}

module.exports = {
  install
}
