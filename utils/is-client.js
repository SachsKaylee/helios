/**
 * true if we are running client side code, false if server side code.
 */
const isClient = () => typeof window !== "undefined";

module.exports = isClient;
