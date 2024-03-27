const express = require("express");
const router = express.Router();
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });
const Stors = require("../models/store");
const Product = require("../models/products");
const User = require("../models/users");
const StoreReviews = require("../models/StoreReviews");
const catchAsync = require("../utile/catchAsync");
const passport = require("passport");
const { isLoggedIn, correctPin, isAuthorStore } = require("../validation");
router.get(
  "/account",
  isLoggedIn,
  catchAsync(async (req, res) => {
    const user = await User.findById(req.user.id);
    const store = await Stors.findOne({ author: user.id })
      .populate("products")
      .populate({
        path: "StoreReviews",
        populate: {
          path: "author",
        },
      });
    let rating = 0;
    let numberProduct = 0;
    if (store) {
      let count = 0;
      store.StoreReviews.map((e) => {
        rating += e.rating;
        count++;
      });
      rating = rating / count;
      store.products.map((p) => {
        numberProduct++;
      });
    }
    res.render("users/account", { user, store, rating, numberProduct });
  })
);
router.post(
  "/account/addPhoneNumber",
  catchAsync(async (req, res) => {
    const { phoneNumber } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { phoneNumber });

    res.redirect("/account");
  })
);
router.delete(
  "/store/:id",
  isLoggedIn,
  isAuthorStore,
  correctPin,
  catchAsync(async (req, res) => {
    const userId = req.user._id;
    const user = await User.findById(userId);
    const storeId = user.store;

    const deleteStoreFromUser = await User.findByIdAndUpdate(
      userId,
      //

      { $unset: { store: 1 } },
      { new: true }
    );
    const store = await Stors.findByIdAndDelete(storeId);
    res.redirect("/stores");
  })
);

module.exports = router;
