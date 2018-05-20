const mapObject = (obj, fn) => Object.keys(obj).reduce((a, k) => ({ ...a, [k]: fn(obj[k], k) }), {});

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

module.exports = {
  mapObject,
  splice
}