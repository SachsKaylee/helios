/**
 * Filters the array to only contain unique elements.
 * @param {T[]} array The array.
 * @template T
 */
const unqiue = array => Array.from(new Set(array));

module.exports = unqiue;
