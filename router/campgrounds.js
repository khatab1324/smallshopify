// ===========require file =====================
const catchAsync = require("../utils/catchAsync");
const Campground = require("../models/campground");
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");
const campgroundControllers = require("../controllers/campgrounds");
// ===========require libary====================
const express = require("express");
const { models } = require("mongoose");
const multer = require("multer"); //it use for upoalde image and file //usage :Multer adds a body object and a file or files object to the request object. The body object contains the values of the text fields of the form, the file or files object contains the files uploaded via the form.
// const upload = multer({ dest: "uploads/" }); //here you specify the destination for where you will save your file //this just a demo in real world ,we don't save our fail locally
const { storage } = require("../cloudinary"); //it auto will know index.js file
// const upload = multer({ dest: "uploads/" }); //here you specify the destination for where you will save your file //this just a demo in real world ,we don't save our fail locally
const upload = multer({ storage });
const router = express.Router();
// we expects you to have these dependencies installed. install three passport /passport local/passport local monoose
// npm install passport mongoose passport-local-mongoose

// ==========campgrounds=======================

//now we will use router.route its usege , if you have deffrent router like get and post .... and all the router have the same path
//.... you can collect them in one route like this
router
  .route("/campgrounds")
  .get(
    //I make refactor, that refactor take fuction and put it in controllers campgrounds,to make it very shrot and straitful
    catchAsync(campgroundControllers.index) //here rether than put our fuction have req and res we add it in controllers file
  ) //rether then using try and catch we call fucntion that catch the error
  .post(
    isLoggedIn,
    upload.array("image"), //we should download image before validate work, if we did't do this out validation will goes wrong
    validateCampground,
    catchAsync(campgroundControllers.createCampground)
    // (req, res) => {
    //   //upload.single(the piece should look at it)//and it upload for you one file
    //   //if you use upload.array it will apload multiple file but you shoud attribut in input that in html called multiple
    //   console.log(req.body, req.files); //now you can see the path its link for your image or file you can copy it and pass it in browser   //req.file it send for you all info ubout file that had been send
    //   //and if you notis he make file that called uploads
    //   res.send("sended");
    // }
  );

router.get("/campgrounds/new", isLoggedIn, campgroundControllers.renderNewForm);

router
  .route("/campgrounds/:id")
  .get(catchAsync(campgroundControllers.showCampground))
  .put(
    isLoggedIn,
    isAuthor,
    upload.array("image"), //it should before validateCampground becuase the error campground is require don't shown to you
    validateCampground,

    catchAsync(campgroundControllers.updateCampground)
  )
  .delete(
    isLoggedIn,
    isAuthor,
    catchAsync(campgroundControllers.deleteCampground)
  );

router.get(
  "/campgrounds/:id/edit",
  isLoggedIn,
  catchAsync(campgroundControllers.renderEditForm), ///campgrounds/64bbcb5b40c37ec495a1f887/edit if you chnage the Id your server will be down and I amke the easy way that make the athore down (last check) and it work for me if you make your code more powr zarko solve this problem in leture 558
  isAuthor
);

module.exports = router; //I write modele and this err show me Router.use() requires a middleware function but got a Object
