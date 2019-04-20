const HeliosError = require("./HeliosError");

module.exports = class PermissionError extends HeliosError {
  /**
   * Creates the error. This error is used to indicate that the user lacks a given permission to perform a certain action.
   * @param {string} permission The missing permission.
   */
  constructor(permission) {
    super(permission ? "Missing permission: " + permission : "Missing permission", 403);
    this.details = {
      permission: permission
    };
  }
}
