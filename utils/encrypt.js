const crypto = require("crypto");

/**
 * Encrypts(hashes using sha256) a string.
 * @param {string} value The string to encrypt.
 * @param {string} salt The salt to use.
 */
const encrypt = (value, salt) => crypto.createHmac("sha256", salt).update(value).digest("hex");

module.exports = encrypt;
