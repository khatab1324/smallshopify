const mongoose = require("mongoose");
const { places, descriptors } = require("./storesSeeds");
const cities = require("./cities");
const Store = require("../models/storeData"); //this our schema and remember we are define it before define our data
mongoose
  .connect("mongodb://localhost:27017/smallshopify", {
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
const sample = (array) => array[Math.floor(Math.random() * array.length)];
const seedDB = async () => {
  await Store.deleteMany({}); //to not overwrite
  for (let i = 0; i < 4; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const store = new Store({
      //new form schema

      image:
        "https://www.dreamhost.com/blog/wp-content/uploads/2019/06/afa314e6-1ae4-46c5-949e-c0a77f042e4f_DreamHost-howto-prod-descrips-full.jpeg",
      location: cities[random1000].city,
      title: `${sample(descriptors)} ${sample(places)}`,
      description:
        "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Perferendis possimus architecto magni, quia maiores dolor, omnis totam ullam, nulla odio eaque qui perspiciatis et? Quos deleniti non animi fuga ex?",
     

      //there just remain athoer and img and geometry
    });
    await store.save();
  }
};
seedDB().then(() => {
  mongoose.connection.close(); //conected and close
});
