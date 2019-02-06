const HeliosError = require("./HeliosError");

module.exports = class NotLoggedInError extends HeliosError {
  constructor() {
    super("Not logged in", 403);
  }
}
