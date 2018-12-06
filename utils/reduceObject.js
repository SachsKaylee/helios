/**
 * Reduces an object.
 * @param {{}} object The object to reduce.
 * @param {(acc: any, value: any, key: string) => any} fn The function to reduce. Gets accumulator, value and key
 * @param {any} a The initial accumulator.
 * @returns {any} The final accumulator.
 */
const reduceObject = (object, fn, a = {}) => Object.keys(object).reduce((a, k) => fn(a, object[k], k), a);

module.exports = reduceObject;
