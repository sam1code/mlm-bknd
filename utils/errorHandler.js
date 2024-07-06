// Error handeler class Error handler middleware
class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;

    Error.captureStackTrace(this.constructor);
  }
}
module.exports = ErrorHandler;
