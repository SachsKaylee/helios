const client = require("./client");

module.exports = {
  passwordSecret: "sol-invictus",
  cookieSecret: "7-rays-of-light",
  // The default user to create. Will have admin permissions. Simply delete this 
  // entry or set it to false to avoid creating a default user.
  defaultUser: {
    id: "admin",
    password: "helios"
  },
  maxPayloadSize: client.maxAvatarSize + 100 * 1024,
  client
}