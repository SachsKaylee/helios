const HeliosError = require("./HeliosError");

module.exports = class PermissionError extends HeliosError {
  constructor(permission) {
    super(permission ? "Missing permission: " + permission : "Missing permission", 403);
    this.details = {
      permission: permission
    };
  }
}
