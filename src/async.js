const fp = require("./fp");

const all = promises => {
  const keys = Object.keys(promises);
  return Promise.all(keys.map(key => {
    const value = promises[key];
    return typeof value === 'object' && !value.then
      ? all(value)
      : value;
  }))
    .then(result => fp.zipObject(keys, result));
};

module.exports = {
  all
}