const express = require("express");
const router = express.Router();
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });
const Store = require("../models/store");
const Product = require("../models/products");
const WishList = require("../models/wishList");
const users = require("../models/users");

const catchAsync = require("../utile/catchAsync");
const {
  isLoggedIn,
  isAuthor,
  validateStore,
  validateProduct,
  correctPin,
} = require("../validation");
const products = require("../models/products");

router.get(
  "/wishlist",
  isLoggedIn,
  catchAsync(async (req, res) => {
    const userId = req.user._id;
    const user = await users.findById(userId);
    let wishList = await WishList.findOne({ user: userId }).populate(
      "products"
    );

    console.log("____________the products-_-");
    console.log(wishList);
    res.render("users/wishlist", { wishList });
  })
);
// you should refact this code
router.post(
  "/wishlist/:productId",
  isLoggedIn,
  catchAsync(async (req, res) => {
    console.log("add this to the store");
    const { productId } = req.params;
    const product = await Product.findById(productId);
    const userId = req.user._id;
    const user = await users.findById(userId);
    let wishList = await WishList.findOne({ user: userId }).populate(
      //  NOTE : find give you and array and findOne give you and object
      // you need the object
      "products"
    );
    // clean this code

    if (!wishList) {
      wishList = new WishList();
      wishList.user = user;
      wishList.products = product;
      await wishList.save();
    } else {
      let productExist;
      const isProductExist = () => {
        wishList.products.filter((product) => {
          productExist = product.id === productId;
          if (productExist) {
            productExist = product;
            return product;
          }
        });
      };
      console.log("+++++++++the product++++++++++++");
      console.log(product);
      isProductExist();
      console.log("+++++++++productExist++++++++++++");
      console.log(productExist);
      if (!productExist) {
        wishList.products.push(product);
      }
      await wishList.save();
    }
    res.redirect("/wishlist");
  })
);
router.delete(
  "/wishlist/:productId",
  catchAsync(async (req, res) => {
    const { productId } = req.params;
    const product = await Product.findById(productId);
    const userId = req.user._id;
    const user = await users.findById(userId);
    let wishList = await WishList.findOne({ user: userId }).populate(
      "products"
    );
    let findProduct;
    const productWantDelete = wishList.products.filter((product) => {
      findProduct = product.id === productId;
      if (findProduct) {
        return product;
      }
    });
    // this for product that I want to delete it from the wishList
    await WishList.findByIdAndUpdate(wishList.id, {
      $pull: { products: productWantDelete[0].id },
    });
    res.redirect("/wishlist");
  })
);

module.exports = router;
