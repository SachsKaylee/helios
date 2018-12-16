/**
 * A function that creates a new object with the same values but the key based on the result of a passed function.
 * @param {{}} obj The object to map.
 * @param {(key: string, value: any) => any} fn The function to do the mapping. Gets the key and value.
 */
const mapObjectKeys = (obj, fn) => Object.keys(obj).reduce((a, k) => ({ ...a, [fn(k, obj[k])]: obj[k] }), {});

module.exports = mapObjectKeys;
