const niceUri = require("../../utils/nice-uri");
const mongoose = require('mongoose');
const { permissions } = require("../../common/permissions");

const intOr = (int, or) => Number.isInteger(int) ? int : or;
const stringOr = (string, or) => ("string" === typeof string) ? string : or;

const Page = mongoose.model("page", new mongoose.Schema({
  _id: String,
  title: String,
  elements: [Object],
  path: [String],
  notes: String
}));

// Misc operations
const filterPageData = ({ _id, title, elements, path, notes }, user) => ({
  _id, title, elements, path,
  notes: user && user.hasPermission(permissions.page) ? notes : ""
});

const install = ({ server }) => {
  // API specific middlemare
  server.use((req, res, next) => {
    // Get User & Session data
    req.page = {};

    // Senders
    res.sendPage = async (page, user = req.user.maybeGetUser()) => {
      user = await user;
      Array.isArray(page)
        ? res.sendData({ data: page.map(page => filterPageData(page, user)) })
        : res.sendData({ data: filterPageData(page, user) });
    }

    next();
  });

  // https://stackoverflow.com/questions/5830513/how-do-i-limit-the-number-of-returned-items
  server.get("/api/page", (req, res) =>
    Page
      .find({})
      .sort({ title: "ascending" })
      .skip(intOr(parseInt(req.query.skip), 0)) // TODO: skip has poor performance on large collection
      .limit(intOr(parseInt(req.query.limit), undefined))
      .then(pages => res.sendPage(pages))
      .catch(error => res.error.server(error)));

  server.post("/api/page", (req, res) =>
    req.user.getUser()
      .then(user => {
        if (!user.hasPermission(permissions.page)) {
          return res.error.missingPermission(permissions.page);
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
      .then(page => res.sendPage(page))
      .catch(error => res.error.server(error));
  });

  server.put("/api/page/:id", (req, res) =>
    req.user.getUser()
      .then(user => {
        if (!user.hasPermission(permissions.page)) {
          return res.error.missingPermission(permissions.page);
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

  server.delete("/api/page/:id", async (req, res) => {
    try {
      const user = await req.user.getUser();
      if (!user.hasPermission(permissions.page)) {
        return res.error.missingPermission(permissions.page);
      }
      const page = await Page.deleteOne({ _id: req.params.id });
      return res.sendData({ data: page });
    } catch (error) {
      if (error === "not-logged-in") {
        return res.error.notLoggedIn();
      } else {
        return res.error.server(error);
      }
    }
  });

  server.get("/api/page-paths", (req, res) =>
    Page
      .distinct("path")
      .exec()
      .then(paths => res.sendData({ data: { paths } }))
      .catch(error => res.error.server(error)));

  server.get("/api/page-count", (req, res) =>
    Page
      .estimatedDocumentCount()
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
            if (path[i] === "null") {
              return navigation;
            }
            let child = navigationNode.children.find(child => child.title === path[i]);
            // Create folder path if it does not exist. Flag navigation nodes that are just folders as "synthetic"
            if (!child) {
              child = {
                _id: "page/" + path[i],
                title: path[i],
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
              _id: "page/" + _id,
              title: title,
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
