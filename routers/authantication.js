const express = require("express");
const router = express.Router();
const User = require("../models/users");
const multer = require("multer");
const passport = require("passport");
const { storage } = require("../cloudinary");
const catchAsync = require("../utile/catchAsync");
const { storeReturnTo } = require("../validation");
const upload = multer({ storage });

router.get(
  "/sign-in-user",
  catchAsync(async (req, res) => {
    res.render("users/loginUser");
  })
);
router.post(
  "/sign-in",
  //here will use storeReturnTo
  storeReturnTo,
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/sign-in-user",
  }),
  catchAsync(async (req, res) => {
    req.flash("success", "welcome back!");

   
    const redirectUrl = res.locals.returnTo || "/stores";
    res.redirect(redirectUrl);
  })
);
// ============register user========================
router.get(
  "/register-user",
  catchAsync((req, res) => {
    res.render("users/registerUser");
  })
);
router.post(
  "/register-user",
  catchAsync(async (req, res) => {
    try {
      //i want when there something went wrong like using same username , i want falsh message show to user becuase that I use try and catch
      const { username, email, password, configerPassword } = req.body;
      if (password === configerPassword) {
        //I will remove it when I add validation
        const user = new User({ email, username });
        const newUser = await User.register(user, password);
        
        req.login(newUser, (err) => {
          if (err) {
            return next(err);
          }
          req.flash("success", "welcome in yelp camp");
          res.redirect("/stores");
        });
      } else {
        req.flash("success", "welcome in yelp camp");
        res.redirect("register-user");
      }
    } catch (error) {
      req.flash("error", error.message);
      console.log("the error is : ", error.message);
      res.redirect("/register-user");
    }
  })
);
router.get(
  "/sign-out",
  catchAsync(async (req, res) => {
    req.logout(function (err) {
      //logout its come with passport
      if (err) {
        return next(err);
      }
      req.flash("success", "Goodbye!");
      res.redirect("/stores");
    });
  })
);

module.exports = router;
