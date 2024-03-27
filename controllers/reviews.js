const Campground = require("../models/campground");
const Review = require("../models/review");

module.exports.createReview = async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  //this will middlewere for that req that come from (form)in show.ejs
  const newReview = new Review(req.body.review); //that is because we are give the body or the rating kay
  // in show.ejs you will find review[body] review[rating] that is keys
  //now we will push the newReview to campground
  campground.reviews.push(newReview); //I push newReview like array
  newReview.author = req.user._id;
  //now we will save them
  await newReview.save();
  await campground.save(); //becuase the campground have review in array
  req.flash("success", "Created new review!");
  res.redirect(`/campgrounds/${campground._id}`);
};
//you should know :campId it is not required that mean you can write :id
module.exports.deleteReview = async (req, res) => {
  const { campId, reviewId } = req.params;
  // we should remove the refrens Object id in campground for this review not for all review , just this review
  const deleteRefreceObjectIdInCampground = await Campground.findByIdAndUpdate(
    campId,
    {
      $pull: { reviews: reviewId }, // $pull  operator removes from an existing array all instances of a value or values that match a specified condition.
      // that mean pull goes to reviews and pull that value in our case reviewId and reviewId will not be exist any more in campground,you can find pull in mongoDB
    }
  );
  const deleteReview = await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Successfully deleted review");
  res.redirect(`/campgrounds/${campId}`);
};
