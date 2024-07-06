const ErrorHandler = require("../utils/errorHandler");

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "internal server error";

  //wrong mongoDB id error
  if (err.name === "CastError") {
    const message = `resourse not found. Invalid: ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  // mongoose duplicate key error
  if (err.code === 11000) {
    const message = `this ${Object.keys(err.keyValue)} already exists`;
    err = new ErrorHandler(message, 400);
  }

  // Wrong JWT error
  if (err.name === "JsonWebTokenError") {
    const message = `JsonWebToken is invalid , try again`;
    err = new ErrorHandler(message, 400);
  }

  // Expire JWT error
  if (err.name === "TokenExpiredError") {
    const message = `JsonWebToken is Expired , try again`;
    err = new ErrorHandler(message, 400);
  }

  // INVALID_CREDENTIALS
  if (err.message === "INVALID_CREDENTIALS") {
    const message = `Invalid Credentials`;
    err = new ErrorHandler(message, 401);
  }

  // INVALID_TOKEN
  if (err.message === "INVALID_TOKEN") {
    const message = `Invalid Token`;
    err = new ErrorHandler(message, 401);
  }

  res.status(err.statusCode).send({ success: false, message: err.message });
};
