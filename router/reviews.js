const express = require("express");
const router = express.Router({ mergeParams: true });
// ============require files=================
const Campground = require("../models/campground");
const Review = require("../models/review");
const catchAsync = require("../utils/catchAsync");
const reviewController = require("../controllers/reviews");
// ===================middleware================
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware");
const review = require("../models/review");

//==================reviews======================

router.post(
  "/campgrounds/:id/reviews",
  validateReview,
  isLoggedIn,
  reviewController.createReview
);
router.delete(
  "/campgrounds/:campId/reviews/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  reviewController.deleteReview,

  catchAsync(reviewController.deleteReview)
);

module.exports = router;
