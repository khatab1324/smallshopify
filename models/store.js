const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const opts = { toJSON: { virtuals: true } };
const StoreReview = require("./StoreReviews");
const Product = require("./products");

const storeShema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    images: [
      {
        url: String,
        filename: String,
      },
    ],
    title: String,
    description: String,
    location: String,
    products: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    StoreReviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "StoreReview",
      },
    ],
    pin: String,
    dateCreate: String,
    views: Number,
  },

  opts
);

// ==================I don't know what is these=============
storeShema.virtual("properties.popUpMarkup").get(function () {
  return `<strong><a href="/campgrounds/${this._id}">${this.title}</a><strong>
  <p>${this.description.substring(0, 20)}...</p>`;
});

// here when you delete the the store all the review will delete
storeShema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    const ReviewRemove = await StoreReview.deleteMany({
      _id: { $in: doc.reviews },
    });
  }
});
storeShema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    const ProductRemove = await Product.deleteMany({
      _id: { $in: doc.products },
    });
  }
});

module.exports = mongoose.model("store", storeShema);
