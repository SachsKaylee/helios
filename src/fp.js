const mapObject = (obj, fn) => Object.keys(obj).reduce((a, k) => ({ ...a, [k]: fn(obj[k], k) }), {});
const arrayToObject = (array, processor) => array.reduce((a, c) => ({ ...a, ...processor ? processor(c): c }), {});

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


module.exports = {
  mapObject,
  splice,
  sandbox,
  arrayToObject
}