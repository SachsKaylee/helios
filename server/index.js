const config = require("../config");
const log = require("./log");
const axios = require("axios");
const path = require("path");
const fs = require("fs");
const createNext = require("next");
const express = require("express");
const api = require("./api");
const db = require("./db");
const routes = require("../common/routes");
const { transformError } = require("./error-transformer");
const formData = require("express-form-data");
const blobExtract = require("../utils/blob-extract");
const Redoubt = require("redoubt").default;

const isDevelopment = process.env.NODE_ENV !== "production";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = isDevelopment ? "0" : "1";

const rootPath = path.resolve("./");

log.info("Helios is starting", { isDevelopment, rootPath, NODE_ENV: process.env.NODE_ENV });

const start = async () => {
  try {
    await waitForConfig();
    await adjustGlobals();
    await startCms();
  } catch (error) {
    log.error("Error while starting main", error);
    process.exit(1);
  }
}

const waitForConfig = async () => {
  console.debug("Waiting for configuration...");
  await api.system.systemConfigReady;
  await api.system.internalConfigReady;
  await api.system.hostConfigReady;
  await api.system.themeConfigReady;
}

const adjustGlobals = async () => {
  // Get our configuration
  const cfg = await api.system.getConfig();
  const internalCfg = await api.system.getInternalConfig();
  const hostCfg = await api.system.getHostConfig();

  api.system.loadLocale(cfg.locale);
}

const installMiddleware = async ({ server }) => {
  const uploadDir = path.resolve("./.helios/tmp/upload");
  fs.mkdirSync(uploadDir, { recursive: true });

  server.use(formData.parse({
    autoClean: true,
    uploadDir: uploadDir
  }));
  server.use(formData.union());
  server.use("/node_modules", express.static("./node_modules"));
  server.use("/workbox-v3.6.3", express.static("./.helios/next/workbox-v3.6.3"));
  server.use((req, res, next) => {

    res.sendData = ({ error, data, errorCode, successCode }) => {
      //if (isDevelopment) console.info("sending", { error, data, errorCode, successCode });
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

    res.result = async (result) => {
      result = result instanceof Promise ? await result : result;
      if (result instanceof Error) {
        const status = result.status || 500;
        if (status >= 500) {
          log.error(req.method + " " + req.path + " : " + status, result);
        } else {
          log.debug(req.method + " " + req.path + " : " + status, result);
        }
        res
          .status(status)
          .send({
            status: status,
            name: result.name,
            message: result.message,
            detail: result.detail ? result.detail : {}
          });
      } else {
        const status = result.status || 200;
        if (status >= 500) {
          log.error(req.method + " " + req.path + " : " + status, result);
        } else {
          log.debug(req.method + " " + req.path + " : " + status, result);
        }
        res
          .status(status)
          .send(result.data ? result.data : result);
      }
    }

    res.blob = (blob) => {
      const { data, format, mime } = blobExtract(blob);
      const buffer = Buffer.from(data, format);
      res.writeHead(200, {
        "Content-Type": mime,
        "Content-Length": buffer.length
      });
      res.end(buffer);
    };

    res.error = {};
    res.error.server = (error) => {
      log.error("Internal Server Error\n", error, "\nStack Trace:\n", new Error("Internal Server Error"));
      res.sendData({ error: `internal-server-error`, errorCode: 500 });
    };
    res.error.notFound = () => res.sendData({ error: "not-found", errorCode: 404 });
    res.error.notLoggedIn = () => res.sendData({ error: "not-logged-in", errorCode: 401 });
    res.error.authorizationFailure = () => res.sendData({ error: "authorization-failure", errorCode: 401 });
    res.error.missingPermission = (permission) => res.sendData({ error: `missing-permission-${permission}`, errorCode: 403 });
    res.error.invalidRequest = () => res.sendData({ error: `invalid-request`, errorCode: 400 });

    next();
  });

}

const startCms = async () => {
  // Get our configuration
  const cfg = await api.system.getConfig();
  const internalCfg = await api.system.getInternalConfig();
  const hostCfg = await api.system.getHostConfig();

  // We use the domain in the request and not localhost since our certificate is not signed against localhost, 
  // and we don't accept unsigned certs in production.
  axios.defaults.baseURL = hostCfg.ssl === "none"
    ? `http://${hostCfg.bindDomains[0]}:${process.env.EXPOSED_PORT ? process.env.EXPOSED_PORT : hostCfg.ports.http}`
    : `https://${hostCfg.bindDomains[0]}:${process.env.EXPOSED_PORT ? process.env.EXPOSED_PORT : hostCfg.ports.https}`;

  try {
    log.info("Starting helios in CMS mode");

    const redoubtDevelopment = process.env.FORCE_REDOUBT_PRODUCTION ? false : isDevelopment;
    let ssl = "none";
    switch (hostCfg.ssl) {
      case "none": {
        ssl = "none";
        break;
      }
      case "letsEncrypt": {
        ssl = "letsEncrypt";
        break;
      }
      case "certificate": {
        ssl = {
          key: hostCfg.certs.privateKey,
          cert: hostCfg.certs.publicKey,
          ca: hostCfg.certs.ca,
          allowUnsigned: redoubtDevelopment
        };
        break;
      }
    }

    const redoubt = new Redoubt({
      agreeGreenlockTos: process.env.AGREE_GREENLOCK_TOS == "true",
      ssl: ssl,
      cookieSecret: internalCfg.cookieSecret,
      domains: hostCfg.bindDomains,
      isDevelopment: redoubtDevelopment,
      letsEncryptCertDirectory: "./.helios/certs",
      maxPayloadSize: cfg.maxPayloadSize,
      name: "helios",
      staticFiles: null,
      webmasterMail: hostCfg.mail
    });
    const server = redoubt.app;

    const next = createNext({ dev: isDevelopment });

    await installMiddleware({ server, redoubt, start, next });

    await Promise.all([next.prepare(), db.connected]);

    for (let key in api) {
      if (api[key].preinstall) {
        log.debug("Preinstalling API", { key });
        await api[key].preinstall({ server, redoubt, start, next });
      }
    }
    for (let key in api) {
      log.debug("Installing API", { key });
      await api[key].install({ server, redoubt, start, next });
    }
    log.info("All APIs have been installed.");
    // Fallback
    server.get("/service-worker.js", (req, res) => res.sendFile("./.helios/next/service-worker.js", { root: rootPath }))
    server.get("*", routes.getRequestHandler(next));

    await redoubt.listen(hostCfg.ports.https, hostCfg.ports.http === -1 ? null : hostCfg.ports.http, hostCfg.bindIp);
    log.info("Helios is listening", { ports: hostCfg.ports, domains: hostCfg.bindDomains });
  } catch (error) {
    log.error("Error while starting helios!", error);
    process.exit(1);
  }
}
/*
const startSetup = async () => {
  // todo: pass port & ip as command line option
  const port = 80, ip = "0.0.0.0";
  axios.defaults.baseURL = `http://localhost:${port}`;

  try {
    log.info("Starting helios in setup mode");

    const next = createNext({ dev: isDevelopment });
    await next.prepare();

    const server = express();
    await installMiddleware({ server });

    server.use("/node_modules", express.static("./node_modules"));
    server.get("/api/page-navigation", (req, res) => res.status(200).send([]));

    api.system.install({ server });

    server.get("/", (req, res) => res.redirect("/setup"));

    server.get("*", routes.getRequestHandler(next));
    server.listen(port, ip);
    log.info("Setup is listening", { port, ip });
  } catch (error) {
    log.error("Error while starting setup!", { error });
    process.exit(1);
  }
}
*/

start();
