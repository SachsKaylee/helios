const winston = require("winston");

const prod = process.env.NODE_ENV === "production";
/*
const log = winston.createLogger({
  level: prod ? "info" : "silly",
  format: winston.format.json(),
  defaultMeta: { service: "helios" },
  transports: [
    new winston.transports.File({ filename: '.helios/log/error.log', level: 'error'}),
    new winston.transports.File({ filename: '.helios/log/debug.log', level: 'silly' })
  ]
});

if (!prod) {
  log.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

console.trace = (msg, ...meta) => log.silly(msg, { ...meta, service: "external" });
console.debug = (msg, ...meta) => log.debug(msg, { ...meta, service: "external" });
console.log = (msg, ...meta) => {
  // Filter out useless log spam
  if (typeof msg === "string" || typeof msg === "undefined") {
    msg = typeof msg === "undefined" ? "": msg.trim();
    if (msg.length === 0 && Object.keys(meta).length === 0) {
      return;
    }
  }
  log.info(msg, { ...meta, service: "external" })
};
console.error = (msg, ...meta) => {
  if (msg instanceof Error) {
    if (prod) {
      log.error(msg.message, { ...meta, error: msg.message, stack: msg.stack, name: msg.name, service: "external" })
    } else {
      log.error(msg.name + ": " + msg.message + "\n" + msg.stack, { ...meta, service: "external" })
    }
  } else {
    log.error(msg, { ...meta, service: "external" })
  }
};
console.warn = (msg, ...meta) => log.warn(msg, { ...meta, service: "external" });
console.exception = (msg, ...meta) => log.error(msg, { ...meta, service: "external" });
*/

log = console;
log.silly = console.debug;

log.debug("Logger is ready and intercepting console logs");

module.exports = log;
