const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelper");
const Campground = require("../models/campground");

mongoose
  .connect("mongodb://localhost:27017/yelp-camp", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MONGO CONNECTION OPEN!!!");
  })
  .catch((err) => {
    console.log("OH NO MONGO CONNECTION ERROR!!!!");
    console.log(err);
  });
//sample to bike random name
const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 400; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const camp = new Campground({
      author: "64aecbbe3b10db8f74079892",
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      geometry: {
        type: "Point",
        coordinates: [
          cities[random1000].longitude,
          cities[random1000].latitude,
        ],
      },
      title: `${sample(descriptors)} ${sample(places)}`,
      images: [
        {
          url: "https://res.cloudinary.com/dd4vh5wfd/image/upload/v1690028730/YelpCamp/azssspzr9zsaebvreymp.jpg",
          filename: "YelpCamp/azssspzr9zsaebvreymp",
        },
        {
          url: "https://res.cloudinary.com/dd4vh5wfd/image/upload/v1690028730/YelpCamp/prqtlrqg22zi6mfyhfkp.jpg",
          filename: "YelpCamp/prqtlrqg22zi6mfyhfkp",
        },

        {
          url: "https://res.cloudinary.com/dd4vh5wfd/image/upload/v1690028731/YelpCamp/qzoksd3jqxpbefx3uprh.jpg",
          filename: "YelpCamp/qzoksd3jqxpbefx3uprh",
        },
      ],

      description:
        "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Perferendis possimus architecto magni, quia maiores dolor, omnis totam ullam, nulla odio eaque qui perspiciatis et? Quos deleniti non animi fuga ex?",
      price: Math.floor(Math.random() * 50) + 1,
    });
    await camp.save();
  }
};
seedDB().then(() => {
  mongoose.connection.close(); //conected and close
});
