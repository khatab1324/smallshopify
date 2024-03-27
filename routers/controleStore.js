const express = require("express");
const router = express.Router();
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });
const Stors = require("../models/store");
const Product = require("../models/products");
const users = require("../models/users");
const { cloudinary } = require("../cloudinary"); //there inside it dirctory that distroy the imgs that in cloudinary

const catchAsync = require("../utile/catchAsync");
const {
  isLoggedIn,
  validateStore,
  validateProduct,
  correctPin,
  isAuthorStore,
  validateStoreUpdate,
} = require("../validation");
const products = require("../models/products");
router.get(
  "/stores/:storeId/controle",
  catchAsync(async (req, res) => {
    const { storeId } = req.params;
    const store = await Stors.findById(storeId).populate("author");

    let capital = 0;
    for (let product of store.products) {
      capital += product.price;
    }
    res.render("Stores/controle", { store, capital });
  })
);
// update store
router.post(
  "/store/:id",
  isLoggedIn,
  isAuthorStore,
  upload.array("image"),
  catchAsync(validateStoreUpdate),
  correctPin, //there is problem when send form have enctype="multipart/form-data" novalidate the pin will be undefined//ubdate the problem now unexpected
  catchAsync(async (req, res) => {
    console.log("req body**********************", req.body);
    const { title, description, location, image } = req.body;
    const { id } = req.params;
    const store = await Stors.findById(id);
    const updatestore = await Stors.findByIdAndUpdate(id, {
      title,
      description,
      location,
    });
    const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
    store.images.push(...imgs);
    store.save();
    if (req.body.deleteImages) {
      for (let filename of req.body.deleteImages) {
        await cloudinary.uploader.destroy(filename);
      }
      await store.updateOne({
        $pull: { images: { filename: { $in: req.body.deleteImages } } },
      });
    }
    res.redirect(`/store/${id}`);
  })
);

router.post(
  "/store/:storeId/delete",
  catchAsync(async (req, res) => {
    const { storeId } = req.params;
    await Stors.findByIdAndDelete(storeId);
    console.log("the store deleted");
    req.flash("success", "Successfully deleted campground");
    res.redirect(`/stores`);
  })
);

module.exports = router;
