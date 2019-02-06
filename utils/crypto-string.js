const crypto = require("crypto");

/**
 * Gets a cryptographically secure string of the given length.
 * @param {number} length The desried length
 */
const cryptoString = (length = 48) => new Promise((res, rej) => crypto.randomBytes(length, (error, buffer) => error
  ? rej(error)
  : res(buffer.toString("hex"))));

module.exports = cryptoString;
