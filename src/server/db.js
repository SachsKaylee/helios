/*
 * Contains the database for Helios.
 * Important note: Do not require this file in an API module. This would trigger an circular dependency and mess things up. Instead rely on the arguments passed to install.
 */
const mongoose = require('mongoose');
const api = require("./api");
const fp = require("../fp")
const config = require("../config/server");

mongoose.connect(config.db.uris, config.db.options);
mongoose.connection.on("error", err => console.error("Mongoose Error", err));

const $makeModel = (source, name) => mongoose.model(name, source.schema({ mongoose, name }));

const connected = new Promise(res => mongoose.connection.once('open', () => {
  const models = fp.mapObject(api, (source, name) => source.schema && $makeModel(source, name));
  console.log("DB Connected!", "APIs:", Object.keys(api));
  res({ models, mongoose });
}));

module.exports = {
  mongoose,
  connected
};