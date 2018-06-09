const fs = require("fs");
const axios = require("axios");
const spdy = require("spdy");
const path = require("path");
const createNext = require("next");
const express = require("express");
const session = require("express-session");
const greenlock = require("greenlock-express");
const compression = require("compression");
const api = require("./api");
const db = require("./db");
const robots = require("./robots");
const config = require("../config/server");
const areIntlLocalesSupported = require("intl-locales-supported");
const reactIntl = require("react-intl");

const isDevelopment = process.env.NODE_ENV !== "production";

// We use the domain in the request and not localhost since our certificate is not signed against localhost, 
// and we don't accept unsigned certs in production.
axios.defaults.baseURL = `https://${config.client.domains[0]}:${config.client.port.https}`;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = isDevelopment || config.certs.allowUnsigned ? "0" : "1";

console.log("📡", "Helios is starting ...");
console.log("📡", "Dev-Mode:", isDevelopment);

// Load the locale data for NodeJS if it has not been installed.
if (global.Intl && !areIntlLocalesSupported([config.client.locale.meta.id])) {
  console.log("📡", "Polyfilling locale for NodeJS", config.client.locale.meta.id);
  const IntlPolyfill = require('intl');
  Intl.NumberFormat = IntlPolyfill.NumberFormat;
  Intl.DateTimeFormat = IntlPolyfill.DateTimeFormat;
} else if (!global.Intl) {
  console.log("📡", "Polyfilling Intl for NodeJS");
  global.Intl = require('intl');
}
reactIntl.addLocaleData(config.client.locale.meta.intl);

const $send = (res, { error, data, errorCode, successCode }) => {
  if (isDevelopment) console.info("sending", { error, data, errorCode, successCode })
  if (error) {
    res.status(errorCode || 500);
    res.send(error);
  } else if (!data) {
    res.status(errorCode || 404);
    res.send("no-data");
  } else {
    res.status(successCode || 200);
    res.send(data);
  }
}
$send.missingPermission = (res, permission) => $send(res, { error: `missing-permission-${permission}`, errorCode: 403 });
$send.incorrectPassword = (res) => $send(res, { error: "incorrect-password", errorCode: 400 });
$send.blob = (res, blob) => {
  const [details, data] = blob.split(",");
  const [mime, format] = details.split(";");
  const buffer = new Buffer(data, format);
  res.writeHead(200, {
    "Content-Type": mime.substr("data:".length),
    "Content-Length": buffer.length
  });
  res.end(buffer);
};

// Creates the express server BUT DOES NOT LISTEN TO it that will be used to handle requests.
const installServer = () => {
  const next = createNext({
    dev: isDevelopment,
    dir: "./src"
  });
  const server = express();
  Promise.all([next.prepare(), db.connected]).then(([_, dbResolved]) => {
    server.use(compression({ filter: shouldCompress }));
    server.use(express.json({ limit: config.maxPayloadSize }));
    server.use(express.urlencoded({ limit: config.maxPayloadSize, extended: true }));
    server.use("/static", express.static("static"));
    server.use(session({
      // todo: Use a better session store! (MongoDB)
      name: "helios",
      cookie: {
        httpOnly: true,
        sameSite: true,
        secure: true // todo: test this with a proxy! -> server.set("trust proxy", 1); to trust 1st proxy
      },
      resave: false,
      saveUninitialized: false,
      unset: "destroy",
      secret: config.cookieSecret
    }));

    // Pages
    server.get("/admin/post/:id", (req, res) => next.render(req, res, "/admin/post", req.params));
    server.get("/post", (req, res) => next.render(req, res, "/", req.params));
    server.get("/post/:id", (req, res) => next.render(req, res, "/post", req.params));
    server.get("/about", (req, res) => next.render(req, res, "/about", req.params));
    server.get("/about/:id", (req, res) => next.render(req, res, "/about", req.params));

    // APIs
    const installData = { ...dbResolved, server, $send };
    robots.install(installData);
    Object.keys(api).forEach(k => !api[k].doNotInstall && api[k].install(installData));

    // Fallback
    server.get("*", next.getRequestHandler());
  }).catch(err => console.error("🔥", "Error while preparing server!", err));
  return server;
}

const shouldCompress = (req, res) => {
  if (isDevelopment) return false;
  if (req.headers["x-no-compression"]) return false;
  return compression.filter(req, res);
}

// This installs greenlock, which is used for lets-encrypt.
const installGreenlock = () => greenlock.create({ ...greenlockOptions(), app: installServer() })
  .listen(config.client.port.http, config.client.port.https, err => err
    ? console.error("🔥", "Error while listening to greenlock", err)
    : console.log("📡", `Listening on greenlock ports HTTP ${config.client.port.http} & HTTPS ${config.client.port.https}!`));

const greenlockOptions = () => ({
  agreeTos: true, // todo : You MUST NOT build clients that accept the ToS without asking the user
  version: "draft-11",
  server: isDevelopment ? "https://acme-staging-v02.api.letsencrypt.org/directory" : "https://acme-v02.api.letsencrypt.org/directory",
  email: config.webmasterMail,
  approveDomains: config.client.domains,
  configDir: path.resolve(__dirname, "../config"),
  debug: isDevelopment,
  communityMember: false,
  telemetry: false
});

// This installs spdy, which is used for own certificates.
const installSpdy = () => {
  const server = installServer();

  // HTTP Server
  if (config.client.port.http) {
    const fallbackServer = express();
    fallbackServer.get("*", (req, res) => res.redirect("https://" + req.headers.host + ":" + config.client.port.https + req.url));
    fallbackServer.listen(config.client.port.http, err => err
      ? console.error("🔥", "Error while listening to fallback HTTP server", err)
      : console.log("📡", `Listening on fallback HTTP port ${config.client.port.http}!`));
  }
  // HTTPS Server
  spdy.createServer(spdyOptions(), server).listen(config.client.port.https, err => err
    ? console.error("🔥", "Error while listening", err)
    : console.log("📡", `Listening on primary HTTPS port ${config.client.port.https}!`))
}

const spdyOptions = () => ({
  key: fs.readFileSync(config.certs.key),
  cert: fs.readFileSync(config.certs.cert)
});

const runServer = () => config.certs === "lets-encrypt" ? installGreenlock() : installSpdy();

// Alright, let's rock! 🤘
runServer();