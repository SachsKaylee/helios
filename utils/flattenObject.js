const mapObjectKeys = require("./mapObjectKeys");

/**
 * Flattens a simple object to a single depth one.
 * `{ "obj": { "key1": [3, 2], "key2": true } }` -> `{ "obj.key1.0": 3, "obj.key1.1": 2, "obj.key2": true }`
 * @param {{}} obj The object to flatten.
 * @param {string} sep The separator to use between the keys. By default `.` is used.
 */
const flattenObject = (obj, sep = ".") =>
  Object.keys(obj).reduce((a, k) => {
    const value = obj[k];
    const joinKeys = key => k + sep + key;
    if (value && "object" === typeof value) return { ...a, ...mapObjectKeys(flattenObject(value), joinKeys) };
    return { ...a, [k]: value };
  }, {});

module.exports = flattenObject;
