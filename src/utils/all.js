/**
 * Check if all elements in an object or array fit a predicate.
 * @param {{} | array} obj The object or array to check.
 * @param {(value: any, key: string | number, object: {} | array) => boolean} predicate The predicate.
 */
const all = (obj, predicate) => {
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      if (!predicate(obj[i], i, obj)) {
        return false;
      }
    }
  } else {
    for (let key in obj) {
      if (!predicate(obj[key], key, obj)) {
        return false;
      }
    }
  }
  return true;
}

module.exports = all;
