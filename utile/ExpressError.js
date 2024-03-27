class ExpressError extends Error {
  //this will show you the error
  constructor(message, statusCode) {
    super();
    this.statusCode = statusCode;
    this.message = message;
  }
}

module.exports = ExpressError;
