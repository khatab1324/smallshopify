const express = require("express");
const router = express.Router();
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });
const Stors = require("../models/store");
const Product = require("../models/products");
const users = require("../models/users");
const StoreReviews = require("../models/StoreReviews");

const catchAsync = require("../utile/catchAsync");
const {
  isLoggedIn,
  validateStore,
  validateProduct,
  validateReview,
  isReviewAuthor,
  isHaveStore,
} = require("../validation");
const products = require("../models/products");

//============requaire to hash pin =============
const crypto = require("crypto");
const util = require("util");
const scrypt = util.promisify(crypto.scrypt);

router.get(
  "/stores",
  catchAsync(async (req, res) => {
    const stores = await Stors.find({}).populate("products");
    let username;
    if (req.session.passport) {
      username = req.session.passport.user;
    }
    let store;
    if (req.user) {
      store = req.user.store;
    }

    req.flash("success", "Successfully made a new store!");
    res.render("Stores/stores", { stores, username, store });
  })
);
router.get(
  "/store/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const store = await Stors.findById(id)
      .populate("products")
      .populate({
        path: "StoreReviews",
        populate: {
          path: "author",
        },
      });
    let increseviews = store.views;

    increseviews++;
    const increViews = await Stors.findByIdAndUpdate(id, {
      views: increseviews,
    });
    res.render("Stores/showStore", { store });
  })
);

// ===============================create store=================
router.get(
  "/create-store",
  isLoggedIn,
  isHaveStore,
  upload.array("images"),
  catchAsync(async (req, res) => {
    let author;
    let user;
    if (req.session.passport) {
      // you can use req.user make refactor
      author = req.session.passport.user;
      user = await users.findOne({ username: author });
    }
    req.flash("success", "Successfully made a new store!");
    res.render("Stores/createStore", { author });
  })
);
router.post(
  "/create-store",
  isLoggedIn,
  upload.array("images"),
  isHaveStore,
  catchAsync(validateStore),
  catchAsync(async (req, res) => {
    const isStoreExist = await Stors.findOne({ author: req.user._id });
    if (isStoreExist) {
      req.flash("error", "sorry you have already store");
      res.redirect("/stores");
    } else {
      const store = new Stors(req.body);
      store.images = req.files.map((f) => ({
        url: f.path,
        filename: f.filename,
      }));
      store.author = req.user._id;
      store.views = 0;
      // date
      const date = new Date();
      let currentDay = String(date.getDate()).padStart(2, "0");
      let currentMonth = String(date.getMonth() + 1).padStart(2, "0");
      let currentYear = date.getFullYear();
      let currentDate = `${currentDay}-${currentMonth}-${currentYear}`;
      store.dateCreate = currentDate;

      const salt = crypto.randomBytes(8).toString("hex");
      const buf = await scrypt(store.pin, salt, 64);
      store.pin = `${buf.toString("hex")}.${salt}`;
      await users.findByIdAndUpdate(req.user.id, { store: store._id });
      await store.save();
      const findStore = await Stors.findById(store._id).populate("author");
      res.redirect("/stores");
    }
  })
);
module.exports = router;
