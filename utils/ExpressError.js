class ExpressError extends Error {
  constructor(message, statusCode) {
    //the message it begain ohhhhhhhhh my gooooooood
    //don't wory just this was error and I solve it
    super();

    this.statusCode = statusCode;
    this.message = message;
  }
}

module.exports = ExpressError;
