const routes = module.exports = require('next-routes')();

routes
  .add("/", "/")
  .add("/post", "/")
  .add("/post/:id", "/post")
  .add("/about", "/about")
  .add("/about/:id", "/about")
  .add("/admin/user", "/admin/user")
  .add("/admin/user/:id", "/admin/user")
  .add("/admin/post", "/admin/post")
  .add("/admin/post/:id", "/admin/post");