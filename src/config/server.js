const client = require("./client");
const path = require("path");

module.exports = {
  // The secret used to encrypt the passwords in the DB.
  passwordSecret: "sol-invictus",

  // The secret used to encrypt clients. The encryption is done on the server, the 
  // encrypted data is stored on the client.
  cookieSecret: "7-rays-of-light",

  // The default user to create. Will have admin permissions. Simply delete this 
  // entry or set it to false to avoid creating a default user.
  defaultUser: {
    id: "admin",
    password: "helios"
  },

  // The port your server runs on. You typically don't want to change this. Make 
  // sure to forward the port!
  port: 443,

  // The max size of data that can be sent in a single request.
  maxPayloadSize: client.maxAvatarSize + 100 * 1024,

  // Paths to your SSL certificates. Make sure they are signed by a proper authority 
  // if used for a public server, or browsers will complain. (This typically isn't free)
  // The two certificates included by default are development certificates and not
  // meant for production. They are not signed.
  certs: {
    // Are unsigned certs allowed in production? (NOT recommended)
    allowUnsigned: true,
    // Your keys. They are to be placed in this directory.
    key: path.resolve(__dirname, "./key.pem"),
    cert: path.resolve(__dirname, "./server.crt")
  },

  // The client configuration should also be available on the server.
  client
}