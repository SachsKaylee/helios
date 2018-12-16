/**
 * A function that creates a new object with the same keys but the value based on the result of a passed function.
 * @param {{}} obj The object to map.
 * @param {(value: any, key: string) => any} fn The function to do the mapping. Gets the value and key.
 */
const mapObject = (obj, fn) => Object.keys(obj).reduce((a, k, i) => ({ ...a, [k]: fn(obj[k], k) }), {});

module.exports = mapObject;
