const dotenv = require("dotenv");

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

if (process.env.ENV) {
  process.env.NODE_ENV = process.env.ENV;
}

module.exports = dotenv;
