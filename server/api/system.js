const cryptoString = require("../../utils/crypto-string");
const random = require("../../utils/random");
const timeout = require("../../utils/timeout");
const { uuid } = require("../../utils/uuid");
const mongoose = require("mongoose");
const reactIntl = require("react-intl");
const areIntlLocalesSupported = require("intl-locales-supported");
const { permissions } = require("../../common/permissions");

const SYSTEM_ID = "system";
const INTERNAL_ID = "internal";

const System = mongoose.model(SYSTEM_ID, new mongoose.Schema({
  _id: { type: String, default: SYSTEM_ID },
  locale: { type: String, enum: ["en", "de"], default: "en" },
  domains: { type: [String], default: ["localhost"] },
  ports: {
    http: { type: Number, default: 80 },
    https: { type: Number, default: 443 }
  },
  webmasterMail: { type: String, default: "" },
  ssl: { type: String, enum: ["letsEncrypt", "certificate", "none"], default: "none" },
  title: { type: String, default: "Helios" },
  description: { type: String, default: "Welcome to Helios - A minimalistic CMS for the modern web." },
  topics: { type: [String], default: ["helios", "cms"] },
  postsPerPage: { type: Number, default: 10 },
  postsPerAboutPage: { type: Number, default: 3 },
  hideLogInButton: { type: Boolean, default: false },
  defaultTags: { type: [String], default: [] },
  promptForNotificationsAfter: { type: Number, default: 10000 },
  promptForAddToHomeScreenAfter: { type: Number, default: 120000 },
  branding: { type: Boolean, default: true },
  maxPayloadSize: { type: Number, default: 200 * 1024 + 100 * 1024 }
}, { collection: "settings" }));

const Internal = mongoose.model(INTERNAL_ID, new mongoose.Schema({
  _id: { type: String, default: INTERNAL_ID },
  passwordSecret: { type: String },
  cookieSecret: { type: String },
  subscriptionSecret: { type: String }
}, { collection: "settings" }));

/**
 * Gets the user facing configuration document.
 */
const getConfig = () => System.findById(SYSTEM_ID).exec();

/**
 * Gets the internal configuration document. Contains sensitive internal data.
 */
const getInternalConfig = () => Internal.findById(INTERNAL_ID).exec();

/**
 * Gets the locale of the CMS.
 */
const getLocale = async () => {
  const cfg = await getConfig();
  const id = cfg ? cfg.locale : "en";
  return require(`../../locale/${id}`);
}

const systemConfigReady = getConfig().then(cfg => {
  console.log("Config is", cfg);
  if (!cfg) {
    cfg = new System();
    return cfg.save().then(cfg => console.log("Created initial config", cfg));
  }
  return cfg;
}).catch(error => {
  console.error("Failed to get config", error);
  return error;
});

const internalConfigReady = getInternalConfig().then(async cfg => {
  console.log("Internal config is", cfg);
  if (!cfg) {
    cfg = new Internal({
      _id: INTERNAL_ID,
      passwordSecret: await cryptoString(random.integer(36, 48)),
      cookieSecret: await cryptoString(random.integer(36, 48)),
      subscriptionSecret: await cryptoString(random.integer(36, 48))
    });
    return cfg.save().then(cfg => console.log("Created initial internal config", cfg));
  }
  return cfg;
}).catch(error => {
  console.error("Failed to get internal config", error);
  return error;
});

const preinstall = ({ server }) => {
  const id = uuid();
  console.log("Created Server ID", { id });
  // API specific middlemare
  server.use((req, res, next) => {
    // Get config
    req.system = {
      id: id,
      config: getConfig,
      locale: getLocale,
      internal: getInternalConfig
    };

    next();
  });
}

const install = ({ server, redoubt, start, next }) => {
  server.get("/api/system/config/system", async (req, res) => {
    const data = await req.system.config();
    return res.result({ data });
  });

  server.get("/api/system/config/internal", async (req, res) => {
    const data = await req.system.config();
    return res.result({ data });
  });

  server.get("/api/system/ping", async (req, res) => {
    console.log("Asking for system ID", { id: req.system.id });
    res
      .header("Access-Control-Allow-Origin", "*")
      .header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
      .status(200)
      .type("text/plain")
      .send(req.system.id)
      .end();
  })

  server.post("/api/system/restart", async (req, res) => {
    const { now } = req.body;
    // Only the admin can restart the server.
    const user = await req.user.getUser();
    if (!user.hasPermission(permissions.admin)) {
      return res.error.missingPermission(permissions.admin);
    }
    // Reply right away, since we won't be able to reply once the HTTP server has shut down 🙄
    console.log("Restart begun!");
    res.status(202).end();
    // Wait for a tick to send the response, otherwise restarting redoubt will kill it.
    await timeout.pass(1);
    // Stop next.js(the view layer)
    console.log("Stopping next ...");
    await next.close();
    // Stop the actual HTTP & HTTPS server.
    console.log("Stopping redoubt ...");
    await redoubt.close(!!now);
    console.log("Starting CMS ...");
    // And restart it.
    await start();
    console.log("Restart complete!");
    // How does the client how that we are done since we have already replied earlier?
    // - By polling /api/system/ping - the result of this API call is unique per execution.
  });

  server.put("/api/system/config/system", async (req, res) => {
    try {
      // Only the admin can change system settings.
      const user = await req.user.getUser();
      if (!user.hasPermission(permissions.admin)) {
        return res.error.missingPermission(permissions.admin);
      }
      // Update the setting with the given data
      let cfg = await req.system.config();
      await cfg.update(req.body).exec();
      const newCfg = await req.system.config();
      // Reload locale if required.
      if (cfg.locale !== newCfg.locale) {
        loadLocale(newCfg.locale);
      }
      // Done
      return res.result({ data: newCfg });
    } catch (error) {
      res.result(error);
    }
  });
}

const loadLocale = locale => {
  log.debug("Loading locale", { locale });
  // Load the locale data for NodeJS if it has not been installed.
  if (global.Intl && !areIntlLocalesSupported([locale])) {
    log.debug("Polyfilling locale for server", { id: locale })
    const IntlPolyfill = require('intl');
    Intl.NumberFormat = IntlPolyfill.NumberFormat;
    Intl.DateTimeFormat = IntlPolyfill.DateTimeFormat;
  } else if (!global.Intl) {
    log.debug("Polyfilling Intl for server");
    global.Intl = require('intl');
  }
  reactIntl.addLocaleData(locale);
}

module.exports = { preinstall, install, loadLocale, getConfig, getInternalConfig, systemConfigReady, internalConfigReady }
