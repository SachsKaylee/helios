const reduceObject = require("./reduceObject");

const arrayFn = (a, v) => v ? [...a, v] : a;
const objectFn = (a, v, k) => v ? { ...a, [k]: v } : a

/**
 * Reduces the object to only contain truthy entries.
 * @param {{} | array} obj The object.
 */
const onlyTruthy = obj => Array.isArray(obj)
  ? obj.reduce(arrayFn, [])
  : reduceObject(obj, objectFn);

module.exports = onlyTruthy;
