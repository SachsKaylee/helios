/*
 * Contains the database for Helios.
 */
const mongoose = require("mongoose");
const config = require("../../config/server");
const error = require("./error-codes");

mongoose.connect(config.db.uris, config.db.options);
mongoose.connection.on("error", err => console.error("Mongoose Error", err));

const connected = new Promise((res, rej) => {
  mongoose.connection.once("open", () => {
    res();
  });
  mongoose.connect.once("error", () => {
    rej();
  })
});

module.exports = {
  mongoose,
  connected,
  error
};
