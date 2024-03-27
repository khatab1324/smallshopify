const { campgroundSchema } = require("./schemas");
const ExpressError = require("./utils/ExpressError");
const Campground = require("./models/campground");
const { reviewSchema } = require("./schemas.js");
const Review = require("./models/review");

module.exports.isLoggedIn = (req, res, next) => {
  // console.log("REQ.USER", req.user); //its will autocomplete from passport and the passport will use the session, to show the user that in session
  //but I will put it in middleware and use it in every method and it I call it currntUser you can see app.js

  //if the user want to add review or something else but he is not register when he submit the comment the login page will show to him , after he is login or register i , will return him in the same page he was on there to do that
  //..... I need to save his url in session
  //store the url thet are requsting!
  //   console.log(req.path, req.originalUrl);//req.path or req.originalUrl they are the same thing

  if (!req.isAuthenticated()) {
    // isAuthenticated() it come from passport it check if you logged in

    req.session.returnTo = req.originalUrl;
    req.flash("error", "You must be signed in first!");
    return res.redirect("/login");
  }

  next();
};
module.exports.storeReturnTo = (req, res, next) => {
  if (req.session.returnTo) {
    res.locals.returnTo = req.session.returnTo;
  }
  next();
};

module.exports.validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  //it equals form object that in schema
  if (!campground.author.equals(req.user._id)) {
    //NOTE : the user must be login to req.user be difine
    req.flash("error", "You do not have permission to do that!");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};

// ==========================review=========================

module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};
module.exports.isReviewAuthor = async (req, res, next) => {
  const { campId, reviewId } = req.params; //why I put campid? it should have the same name id that in reviews.js file the route delete
  const reveiw = await Review.findById(reviewId);
  if (!reveiw.author.equals(req.user._id)) {
    //NOTE : the user must be login to req.user be difine
    req.flash("error", "You do not have permission to do that!");
    return res.redirect(`/campgrounds/${campId}`);
  }
  next();
};
