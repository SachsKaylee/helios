const pass = (after, arg = "timeout") => new Promise((res, rej) => setTimeout(res, after, arg));
const fail = (after, arg = "timeout") => new Promise((res, rej) => setTimeout(rej, after, arg));

const mustResolveWithin = (promise, timespan) => timespan >= 0
  ? Promise.race([promise, fail(timespan)])
  : promise;

module.exports = {
  pass, fail,
  mustResolveWithin
};
