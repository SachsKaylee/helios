const mongoose = require('mongoose');
const api = require("./api");
const fp = require("../fp")

mongoose.connect("mongodb://localhost/helios");
mongoose.connection.on("error", err => console.error("Mongoose Error", err));

const makeModel = (source, name) => mongoose.model(name, source.schema({ mongoose, name }));

const connected = new Promise(res => mongoose.connection.once('open', () => {
  const models = fp.mapObject(api, makeModel);
  console.log("DB Connected!", "APIs:", Object.keys(api));
  res({ models, mongoose });
}));

module.exports = {
  mongoose,
  connected
};