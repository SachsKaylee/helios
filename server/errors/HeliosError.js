module.exports = class HeliosError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    if (process.env.NODE_ENV === "development") {
      Error.captureStackTrace(this, this.constructor);
    } else if (!this.stack) {
      this.stack = "no stack trace in production";
    }
  }
}
