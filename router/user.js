const express = require("express");
const router = express.Router();
const passport = require("passport");
// ============requir files =============
const catchAsync = require("../utils/catchAsync");
const User = require("../models/user");
const { storeReturnTo } = require("../middleware");
const userControllers = require("../controllers/user");

// I meantion the router.route in campground.js
router
  .route("/register")
  .get(userControllers.renderRegister)
  .post(catchAsync(userControllers.register));
router
  .route("/login")
  .get(userControllers.renderLogin)
  .post(
    // use the storeReturnTo middleware to save the returnTo value from session to res.locals
    storeReturnTo,
    // passport.authenticate logs the user in and clears req.session
    passport.authenticate(
      //passport.authenticate ==>to hash a incoming password and compare that to the hashed output in our database and use that to authenticate a user.
      "local", //we here spasify the strotegy and you can authenticate to google also
      {
        failureFlash: true, //this it just will flash the message for you automaticly
        failureRedirect: "/login", //if thing gose wrong it will redircte to longin
      }
    ),
    userControllers.login
  );

// router.get('/logout', (req, res) => {
//     req.logout();
//     req.flash('success', "Goodbye!");
//     res.redirect('/campgrounds');
// })//you might see this error when you test out the logout functionality: req#logout requires a callback function
// This happens because in the latest versions of Passport.js, the req.logout() method now requires a callback function passed as an argument. Inside this callback function, we will handle any potential errors and also execute the code to set a flash message and redirect the user.

router.get("/logout", userControllers.logout);

module.exports = router;
