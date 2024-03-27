const mongoose = require("mongoose");
const { Schema } = mongoose;
const reviewSchema = new Schema({
  body: String,
  rating: Number,
  author: {
    //this is authorzation that check this review for this user , to edit on it or remove it
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("Review", reviewSchema);
