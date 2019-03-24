/*
 * Contains the database for Helios.
 */
const mongoose = require("mongoose");
const error = require("./error-codes");

mongoose.connect(process.env.DB, JSON.parse(process.env.DB_OPTS));
mongoose.connection.on("error", err => console.error("Mongoose Error", err));

const connected = new Promise((res, rej) => {
  mongoose.connection.once("open", () => {
    console.log("Now connected to database!");
    res();
  });

  // TODO: Try reconnect, remove listener
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
