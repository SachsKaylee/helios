const mapObject = (obj, fn) => Object.keys(obj).reduce((a, k) => ({ ...a, [k]: fn(obj[k], k) }), {});
const mapObjectKeys = (obj, fn) => Object.keys(obj).reduce((a, k) => ({ ...a, [fn(k, obj[k])]: obj[k] }), {});
const arrayToObject = (array, processor) => array.reduce((a, c) => ({ ...a, ...processor ? processor(c) : c }), {});

const reduceObject = (object, fn, a) => Object.keys(object).reduce((a, k) => fn(a, object[k], k), a);

// https://gist.github.com/YuCJ/0a42afc1b578b2545195a7b688dcbab6
const splice = (array, start, deleteCount, items = []) => {
  deleteCount = (deleteCount < 0) ? 0 : deleteCount;
  start = start < 0
    ? Math.abs(start) > array.length
      ? 0
      : array.length + start
    : start > array.length
      ? array.length
      : start;
  return [
    ...array.slice(0, start),
    ...items,
    ...array.slice((start + deleteCount), array.length),
  ];
}

const sandbox = (code, net) => {
  try {
    return code();
  } catch (_) {
    return net && net();
  }
}

const all = (array, predicate) => {
  const invertedPredicate = (value, index, array) => !predicate(value, index, array);
  const found = array.find(invertedPredicate);
  return found === undefined ? true : false;
}

const zipObject = (keys, values) => keys.reduce((accumulator, key, index) => ({ ...accumulator, [key]: values[index] }), {});

const flattenObject = (obj, sep = ".") =>
  Object.keys(obj).reduce((a, k) => {
    const value = obj[k];
    if (value && "object" === typeof value) return { ...a, ...mapObjectKeys(flattenObject(value), oldKey => k + sep + oldKey) };
    return { ...a, [k]: value };
  }, {});

module.exports = {
  mapObject,
  mapObjectKeys,
  reduceObject,
  splice,
  sandbox,
  flattenObject,
  arrayToObject,
  zipObject,
  all
}