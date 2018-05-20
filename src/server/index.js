const express = require('express');
const api = require("./api");
const db = require("./db");

const next = require('next')({
  dev: process.env.NODE_ENV !== 'production',
  dir: "./src"
});

const send = (res, { error, data }) => {
  if (error) {
    res.status(500);
    res.send(error);
  } else if (!data) {
    res.status(404);
    res.send(error);
  } else {
    res.send(data);
  }
}

Promise.all([next.prepare(), db.connected]).then(([_, dbResolved]) => {
  const server = express();

  server.use(express.json());
  server.use(express.urlencoded({ extended: true }));
  server.use("/static", express.static("static"));

  // Pages
  server.get("/admin/post/:id", (req, res) => next.render(req, res, "/admin/post", req.params));
  server.get("/post", (req, res) => next.render(req, res, "/", req.params));
  server.get("/post/:id", (req, res) => next.render(req, res, "/post", req.params));

  // APIs
  Object.keys(api).forEach(k => !api[k].doNotInstall && api[k].install({ ...dbResolved, server, send }));

  // Fallback
  server.get('*', next.getRequestHandler());

  server.listen(80, (err) => err ? console.error("Error while listening", err) : console.log('Listening on port 80!'))
}).catch(err => console.error("Error while preparing server!", err));
