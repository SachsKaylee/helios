const client = require("./client");
const path = require("path");
const fs = require("fs");

module.exports = {
  // The secret used to encrypt the passwords in the DB.
  passwordSecret: "sol-invictus",

  // The secret used to encrypt clients. The encryption is done on the server, the 
  // encrypted data is stored on the client.
  cookieSecret: "7-rays-of-light",

  // The Webmaster mail. This MUST be valid Mail or you won't get a SSL certificate
  webmasterMail: "sonstiges@patrick-sachs.de",

  // The default user to create. Will have admin permissions. Simply delete this 
  // entry or set it to false to avoid creating a default user.
  defaultUser: {
    id: "admin",
    password: "helios"
  },

  // The max size of data that can be sent in a single request.
  maxPayloadSize: client.maxAvatarSize + 100 * 1024,

  // By default we let Let's Encrypt create a nice and free cert for us. If you are
  // hosting on an intranet this is not possible though, so you may prefer the config
  // below.
  //certs: "letsEncrypt",

  // Paths to your SSL certificates. Make sure they are signed by a proper authority 
  // if used for a public server, or browsers will complain. (This typically isn't free)
  // The two certificates included by default are development certificates and not
  // meant for production. They are not signed.
  certs: {
    // Are unsigned certs allowed in production? (NOT recommended)
    allowUnsigned: true,

    // Your keys. They are to be placed in this directory.
    key: fs.readFileSync(path.resolve(__dirname, "./key.pem")).toString(),
    cert: fs.readFileSync(path.resolve(__dirname, "./server.crt")).toString()
  },

  // The connection to your database.
  db: {
    // The database URIs. Contains authentication. 
    // See https://mongoosejs.com/docs/connections.html#connections for details.
    uris: "mongodb://localhost/helios",
    // Some options for the database. 
    // See https://mongoosejs.com/docs/connections.html#options for details.
    options: {}
  },
  
  // Greenlock's(The library we use to create your SSL certificate) license requires you to 
  // manually confirm that you agree to its TOS. If you do, set this value to true:
  agreeGreenlockTos: true,

  // The client configuration should also be available on the server.
  client
}