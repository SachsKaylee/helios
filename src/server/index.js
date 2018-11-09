const axios = require("axios");
const path = require("path");
const createNext = require("next");
const api = require("./api");
const db = require("./db");
const fp = require("../fp");
const routes = require("../routes");
const config = require("../config/server");
const areIntlLocalesSupported = require("intl-locales-supported");
const reactIntl = require("react-intl");
const { transformError } = require("./error-transformer");

const Redoubt = require("redoubt").default;

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

const redoubt = new Redoubt({
  agreeGreenlockTos: config.agreeGreenlockTos,
  certs: config.certs,
  cookieSecret: config.cookieSecret,
  domains: config.client.domains,
  isDevelopment: config.$certsForceProductionServer !== undefined ? !config.$certsForceProductionServer : isDevelopment,
  letsEncryptCertDirectory: path.resolve(__dirname, "../config"),
  maxPayloadSize: config.maxPayloadSize,
  name: config.client.title,
  staticFiles: { from: path.resolve(__dirname, "../../static"), serve: "/static" },
  webmasterMail: config.webmasterMail
});
const server = redoubt.app;

server.use((req, res, next) => {

  res.sendData = ({ error, data, errorCode, successCode }) => {
    if (isDevelopment) console.info("sending", { error, data, errorCode, successCode });
    if (error) {
      res.status(errorCode || 500);
      res.send(transformError(error));
    } else if (!data) {
      res.status(errorCode || 404);
      res.send("no-data");
    } else {
      res.status(successCode || 200);
      res.send(data);
    }
  }

  res.blob = (blob) => {
    const [details, data] = blob.split(",");
    const [mime, format] = details.split(";");
    const buffer = new Buffer(data, format);
    res.writeHead(200, {
      "Content-Type": mime.substr("data:".length),
      "Content-Length": buffer.length
    });
    res.end(buffer);
  };

  res.error = {};
  res.error.missingPermission = (permission) => res.sendData({ error: `missing-permission-${permission}`, errorCode: 403 });
  res.error.incorrectPassword = () => res.sendData({ error: "incorrect-password", errorCode: 400 });

  next();
});

const next = createNext({
  dev: isDevelopment,
  dir: "./src"
});
Promise.all([next.prepare(), db.connected]).then(([_, dbResolved]) => {
  // APIs - APIs can only access APIs ranked "lower"
  // todo: get rid of this weird API design
  const apiData = fp.reduceObject(api, (apiData, currentApi, key) => {
    console.log("📡", "Installing an API ...", key);
    const data = currentApi.install && currentApi.install({ ...dbResolved, server, api: apiData });
    return { ...apiData, [key]: data };
  }, {});
  console.log("📡", "All APIs:", apiData);
  // Fallback
  server.get("*", routes.getRequestHandler(next));
}).catch(err => console.error("🔥", "Error while preparing server!", err));

redoubt.listen(config.client.port.https, config.client.port.http);
