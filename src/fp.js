const mapObject = (obj, fn) => Object.keys(obj).reduce((a, k) => ({ ...a, [k]: fn(obj[k], k) }), {});

module.exports = {
  mapObject
}