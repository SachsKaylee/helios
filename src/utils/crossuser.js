/**
 * Configures an Axios request to keep the user session when making an HTTP request from the server.
 */
const crossuser = (req, opts = {}) => {
  return req
    ? {
      ...opts,
      headers: req.headers
        ? { cookie: req.get("cookie"), ...req.headers }
        : { cookie: req.get("cookie") }
    }
    : opts;
}

export default crossuser;
