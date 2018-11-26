/**
 * Configures an Axios request to keep the user session when making an HTTP request from the server.
 */
const crossuser = (req, opts = {}) => {
  const cookie = req && req.get("cookie");
  return cookie ? {
    ...opts, headers: req.headers
      ? { cookie, ...req.headers }
      : { cookie }
  } : opts;
}

export default crossuser;
