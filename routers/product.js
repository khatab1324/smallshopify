const express = require("express");
const router = express.Router();
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });
const Stors = require("../models/store");
const Product = require("../models/products");
const users = require("../models/users");
const StoreReviews = require("../models/StoreReviews");
const { cloudinary } = require("../cloudinary"); //there inside it dirctory that distroy the imgs that in cloudinary
const catchAsync = require("../utile/catchAsync");
const {
  isLoggedIn,
  isAuthorStore,
  validateStore,
  validateProduct,
  validateReview,
  isReviewAuthor,
  isProductAuthor,
  isAuthorProduct,
  validateEditProduct,
} = require("../validation");
const products = require("../models/products");

// ============send page create store=========
router.get(
  "/store/:id/create-product",
  isLoggedIn,
  catchAsync(isAuthorStore),
  catchAsync(async (req, res) => {
    //show form create product
    const { id } = req.params;
    const store = await Stors.findById(id);

    res.render("Stores/product/createProduct", { store });
  })
);

// ============send page show product=========
router.get(
  "/store/product/:productId",
  catchAsync(async (req, res) => {
    // I am try to make the url /store/:storeId/:productId but it doesnot work
    const { productId } = req.params;
    const product = await Product.findById(productId).populate({
      path: "ProductReviews",
      populate: {
        path: "author",
      },
    });

    res.render("Stores/product/showProduct", { product });
  })
);

// ============send page edit product=========
router.get(
  "/store/product/:productId/edit",
  isLoggedIn,
  catchAsync(isAuthorProduct),
  catchAsync(async (req, res) => {
    // I am try to make the url /store/:storeId/:productId but it doesnot work
    const { productId } = req.params;
    const product = await Product.findById(productId);
    res.render("Stores/product/editProduct", { product });
  })
);

// ============show products=========
router.get(
  "/store/:id/showProducts",
  isLoggedIn,
  catchAsync(isAuthorStore),
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const store = await Stors.findById(id).populate("products");

    // const product= sotre.id.populate()
    const products = store.products;
    res.render("Stores/product/showProducts", { store, products });
  })
);

// ============create product=========
router.post(
  "/store/:id/create-product",
  isLoggedIn,
  catchAsync(isAuthorStore),
  upload.array("images"),
  catchAsync(validateProduct), //mybe this will cause problem if the req from postman//make it after upload.array like the edit product
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const product = new Product(req.body);
    const store = await Stors.findById(id).populate("products");
    product.images = req.files.map((f) => ({
      url: f.path,
      filename: f.filename,
    }));
    store.products.push(product);
    product.store = store._id;
    await store.save();
    await product.save();
    res.redirect(`/store/${id}`);
  })
);

// ============edit product=========
router.post(
  "/store/product/:productId/edit",
  isLoggedIn,
  catchAsync(isAuthorProduct),
  upload.array("images"),
  catchAsync(validateProduct), //it is same validateProduct remove it
  catchAsync(async (req, res) => {
    console.log("req.body+++++++++++++++", req.body);
    const { productId } = req.params;
    const { title, description, quantity, price } = req.body;
    const product = await Product.findByIdAndUpdate(productId, {
      title,
      description,
      quantity,
      price,
    });

    const imageInDataBase = product.images;
    const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
    console.log(imgs);
    if (imgs.length > 0) {
      product.images = [];
      product.images.push(...imgs);
      product.save();
      // remove image from cloudinary
      for (let image of imageInDataBase) {
        await cloudinary.uploader.destroy(image.filename);
      }
    }

    res.redirect(`/store/${product.store}/showProducts`);
  })
);
// ============delete product=========
router.delete(
  "/store/:id/products/:productId",
  isLoggedIn,
  catchAsync(isAuthorStore),
  catchAsync(async (req, res) => {
    const { id, productId } = req.params;
    await Stors.findByIdAndUpdate(id, {
      $pull: { products: productId },
    });
    await Product.findByIdAndDelete(productId);
    console.log("the product deleted");
    req.flash("success", "Successfully deleted product");
    res.redirect(`/store/${id}/showProducts`);
  })
);

module.exports = router;
