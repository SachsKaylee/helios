const HeliosError = require("./HeliosError");

module.exports = class InvalidRequestError extends HeliosError {
  constructor(details) {
    super("Invalid request", 400);
    this.details = details;
  }
}
