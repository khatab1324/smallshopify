const mongoose = require("mongoose");
const { schema } = require("./users");
const Schema = mongoose.Schema;


const ProductReviewShcema = new Schema({
  comment: String,
  rating: Number,
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});
module.exports = mongoose.model("ProductReview", ProductReviewShcema);
