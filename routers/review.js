const express = require("express");
const router = express.Router();
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });
const Stors = require("../models/store");
const Product = require("../models/products");
const users = require("../models/users");
const StoreReviews = require("../models/StoreReviews");
const ProductReviews = require("../models/productReviews");
const catchAsync = require("../utile/catchAsync");
const {
  isLoggedIn,
  validateStore,
  validateProduct,
  validateReview,
  isReviewAuthor,
  isReviewAuthorProduct,
} = require("../validation");
const products = require("../models/products");

//============================ review =================
router.post(
  "/store/:storeId/reviews",
  isLoggedIn,
  catchAsync(validateReview),
  catchAsync(async (req, res) => {
    const { storeId } = req.params;
    const store = await Stors.findById(storeId);
    const storeReview = new StoreReviews(req.body.review);
    store.StoreReviews.push(storeReview);
    storeReview.author = req.user._id;
    storeReview.save();
    store.save();
    res.redirect(`/store/${storeId}/`);
  })
);
router.delete(
  "/store/:storeId/reviews/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  catchAsync(async (req, res) => {
    const { storeId, reviewId } = req.params;
    const deleteReview = await StoreReviews.findByIdAndDelete(reviewId);
    const deleteReviewFromStore = await Stors.findByIdAndUpdate(storeId, {
      $pull: { reviews: reviewId },
    });
    res.redirect(`/store/${storeId}`);
  })
);

//============================ product =================
router.post(
  "/store/product/:productId/reviews",
  isLoggedIn,
  validateReview,
  catchAsync(async (req, res) => {
    const { productId } = req.params;
    const product = await Product.findById(productId);
    const productReview = new ProductReviews(req.body.review);
    console.log(product);
    product.ProductReviews.push(productReview);
    productReview.author = req.user._id;
    productReview.save();
    product.save();
    res.redirect(`/store/product/${productId}/`);
  })
);
router.delete(
  "/store/product/:productId/reviews/:reviewId",
  isLoggedIn,
  isReviewAuthorProduct,
  catchAsync(async (req, res) => {
    const { productId, reviewId } = req.params;
    const deleteReview = await ProductReviews.findByIdAndDelete(reviewId);
    const deleteReviewFromStore = await Product.findByIdAndUpdate(productId, {
      $pull: { reviews: reviewId },
    });
    res.redirect(`/store/product/${productId}`);
  })
);

module.exports = router;
