/**
 * Generates a random integer value between the two inclusive values.
 * @param {number} min The min value (inclusive)
 * @param {number} max The max value (inclusive)
 * @return {number} The generated number.
 */
const integer = (min, max) => min + Math.floor(Math.random() * (max - min + 1));

module.exports = {
  integer
};
