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
    console.log("Now connected to database!");
    res();
  });
  mongoose.connection.once("error", () => {
    console.error("Failed to connect to database!");
    rej();
  })
});

module.exports = {
  mongoose,
  connected,
  error
};
