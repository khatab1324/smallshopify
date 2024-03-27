const mongoose = require("mongoose");
const { Schema } = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true, //519 but its not explain it like you want , becuase of that search about it
  },
});
// So just pass in the result of requiring that package that we installed two user schema plugin and this
//...is going to add on to our schema a username, it's going to add on a field for password.
//...It's going to make sure those usernames are unique, they're not duplicated.
//....It's also going to give us some additional methods that we can use.
//....its geart but it's also a horrible teaching tool because it's totally hidden.We don't know that it's adding a password and adding a username field unless you have somebody tell
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);
