const mongoose = require("mongoose");
const { campgroundSchema } = require("../schemas");
const Review = require("./review");
const Schema = mongoose.Schema;
// https://res.cloudinary.com/dd4vh5wfd/image/upload/w_300/v1689785532/YelpCamp/aer5rog0y8zhicnlhws8.jpg
//look for this url it have w_300                    ^^^^^ here this is api trensform from cloudinary that let you control on img using url
//this link for more https://cloudinary.com/documentation/image_transformations
const ImageSchema = new Schema({
  url: String,
  filename: String,
});
// i have problem when you edit the the campground the tumbnail should show you the image but the problem is it show you one imge and when you upload new imge it shown you the number of episode is 555
ImageSchema.virtual("thumbnail").get(function () {
  //viirtual mean in every on evrey thumbnail
  return this.url.replace("/upload", "/upload/w_200/"); //(this) refear to inside filname
}); //So the reason we use a virtual in case you skipped that video is that we don't need to store this on our model or in the database because it's just derived from the information we're already storing. We're storing the URL. It's not like we're storing an image in Mongo, it's just a URL.So why store two? If we can just make a virtual property that will look to us to the human eye as if it's stored on or stored in our database. But it's not every time we call thumbnail, it's going to do this little calculation, which is it's very lightweight and that's fine. But instead of having slash upload, replace that with slash upload slash w 200 and also you should

// By default, Mongoose does not include virtuals when you convert a document to JSON. For example, if you pass a document to Express' res.json() function, virtuals will not be included by default.
// To include virtuals in res.json(), you need to set the toJSON schema option to { virtuals: true }.
const opts = { toJSON: { virtuals: true } };
// and the popup proprities will not be there

const CampgroundSchema = new Schema(
  {
    title: String,
    price: Number,
    images: [
      //images exapte two things the first one url and filename
      ImageSchema,
    ], //we need it to be array because we will use map
    description: String,
    location: String,
    geometry: {
      //its location
      type: {
        type: String, // Don't do `{ location: { type: String } }`
        enum: ["Point"], // 'location.type' must be 'Point'
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },

    //this call mongoose relationship there is hole section descose that
    author: {
      //this is authorzation that check this campground for this user , to edit on it or remove it
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  opts
  //now you can see the properties in campgroun if you write it
);
//
// virtual will add the properties.popUpMarkup to schema and you can see them in campground just click on any campground in map
CampgroundSchema.virtual("properties.popUpMarkup").get(function () {
  return `<strong><a href="/campgrounds/${this._id}">${this.title}</a><strong>
  <p>${this.description.substring(0, 20)}...</p>`; //how you can have access to this spasify title and id ?I don't sure but I think all the campground called that mean they will be define
  // search for the answer in 569 maby you will find it;
});

// middleewre mogoose i am not sure if I wrtie it but you can find the  viedo 475 and 483
//this subject search about it read about it ....
CampgroundSchema.post("findOneAndDelete", async function (doc) {
  //because we have access to the doc we have delete it we can put argument doc that the thing we delete it and another resone why we can access to it we use post
  //try console.log(doc);and see the doc
  if (doc) {
    const ReviewRemove = await Review.deleteMany({ _id: { $in: doc.reviews } });
    //that mean we will remove where _id feild is in our document that was just deleted in its reviews array.
    //if you console.log(doc) you will see the review as array
  } //that mean doc have review id , if there review I will take this id and go to Review collcetion and remove it
});

module.exports = mongoose.model("Campground", CampgroundSchema);
