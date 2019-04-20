const HeliosError = require("./HeliosError");

module.exports = class AuthorizationError extends HeliosError {
  constructor(details) {
    super("Unable to authorize", 403);
    this.details = details;
  }
}
