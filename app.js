//this for dotenv//processed invoice node environment is an environment variable that is usually just development
//....we're saying if we're running in development mode.if we're in development, yes, we are in development require the EMV package, which is going to take the variables I've defined in .env file and add them into processed
//it's mean it take secret file and add it here
if (process.env.NODE_ENV !== "production") {
  //if we are in development mode it will work
  require("dotenv").config();
}

//new we can access to this key in any file
// console.log(process.env.SECRET);//i comment the SECRET
// =================require laibary============================
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate"); //this for layout to put all the html in it like cjs if you remmeber
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const multer = require("multer"); //it use for upoalde image and file //usage :Multer adds a body object and a file or files object to the request object. The body object contains the values of the text fields of the form, the file or files object contains the files uploaded via the form.
// const { storage } = require("./cloudinary"); //it auto will know index.js file
// const upload = multer({ dest: "uploads/" }); //here you specify the destination for where you will save your file //this just a demo in real world ,we don't save our fail locally
// const upload = multer({ storage }); //here you tell the muter to save the data in cloudinter
const mongoSanitize = require("express-mongo-sanitize"); //this laibary to prevent any thing like {} or something that use code like users%20=db.users.find(%7Busername:%7B"$gt":""%7D%7D)
const helmet = require("helmet"); //its have 11 meddelware that all have to do with HTTP headers, changing the behavior, turning on or off or manipulating headers and all in the name
const MongoDBStore = require("connect-mongo")(session);
const app = express();
// =======================require file ==========================
const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");
const methodOverride = require("method-override");
const campgroundsRouter = require("./router/campgrounds");
const reviewsRouter = require("./router/reviews");
const User = require("./models/user");
const userRoutes = require("./router/user");
const dbUrl = process.env.DB_URL || "mongodb://127.0.0.1:27017/yelp-camp";

mongoose.set("strictQuery", false); //DeprecationWarning: Mongoose: the `strictQuery` option will be switched back to `false` by default in Mongoose 7. Use `mongoose.set('strictQuery', false);` if you want to prepare for this change. Or use `mongoose.set('strictQuery', true);` to suppress this warning.
mongoose

  .connect(dbUrl, {
    //this is url that connect our data to server //that mean my database is do nothing
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

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate); // this for ejsMate if you delete it the file can't render in layout like body open layout folder and boilderplate to understand or open index.ejs
//...that mean this engine to load body inside layout

// ====================session===========
const secret = process.env.SECRET || "thisshouldbeabettersecret!";
// if we want our session information to be stored in Mongo, we need to now use that Mongo store to do that we should creat one before session config
const store = new MongoDBStore({
  url: dbUrl,
  // if you want secret
  secret,
  // touchAfter =>If you're using a newer version of Express Session, you don't want to save all the session on database.Every single time that the user refreshes the page, you can lazy update the session by limiting a period of time So this is referring to basically unnecessary re saves unnecessary updates where the data in the session has not changed.So if the data has changed, if it has or if it needs to be updated, it will be saved and updated.
  // So we'll do touch after 24 hours times 60 minutes in an hour, times 60 seconds, because it needs to be in total number of seconds, not milliseconds, but seconds.
  touchAfter: 24 * 60 * 60, //that mean it will removed after 14 days
});
// Then we just pass that in. But there are we have the option to look for errors.
store.on("error", function (e) {
  console.log("session store error", e);
});
const sessionConfig = {
  store, //this will store our session in mongo
  name: "session", //this will give our cooke a name//to no one see the defult name and stele it and pretend to be the otherone
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    //now i wrtie my cookies open cookies you will find it
    httpOnly: true, //this for securty of cookies you can search just search httpOnly//This basically says that our cookies, at least the ones that are set through the session, are only accessible over HTTP, they're not accessible through JavaScript. So if somebody were to write a script or somehow write some JavaScript that executes on our site and extracts cookies, they would not be able to see our session cookie.
    //  secure:true;//Basically, it says that this cookie should only work over https.
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //this number is week long//this becuase Date.now its number like this 1688917466197
    maxAge: 1000 * 60 * 60 * 24 * 7,
    // NOTE: we use expires for ,like user sign-in ,we won't from him to sign for ever becuase of that after week the expire finsh and he will sign out
    // my date now is 2023/7/6 if you open the cookies you will find in expires 2023-07-16T15:43:43.716Z
  },
};
app.use(session(sessionConfig));

//========================= middlewere=========================
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public"))); //I tell express use public file
// ....and use it if you call it from evry where just call it

app.use(mongoSanitize()); //I here use it now if someone send this http://localhost:2023/?db.users.find(%7Busername:%7B%22$gt%22:%22%22%7D%7D) you will look for query like if console.log(req.query) you will find {} but if was normal like username=khattab you will find in console {username:khattab}

app.use(flash()); //I use flash ,that short action happen for one like when you add product it show you product add ,when you refresh it will goes
//use helmet //pleas reade about the docs is very good
app.use(helmet({ contentSecurityPolicy: false })); //this will enable all the 11 meddelware//If I start my app up and I go to local host anything.My image isn't loading.it will show you error in console ->Refuse to load the script popper bootstrap Unsplash.And then they all say because it violates the following content security policy directive.//but if you set contentSecurityPolicy: false it will turn it off the program will work
// we need to add the crossorigin="anonymous" attribute to all the HTML elements that include resources from external origins. This will allow our application pages to successfully load link and script elements that use external CDN servers (including Mapbox), and also to load images from Cloudinary.
// to know cdn is =>a network of interconnected servers that speeds up webpage loading for data-heavy applications

// here what you allow //We're restricting the locations that we can fetch resources from.to be able to have my application fetch scripts from.
const scriptSrcUrls = [
  //here I allow jsut this secript to use if you use another ones it will not shown to you
  "https://stackpath.bootstrapcdn.com/",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net", //By the time I got to implementing Bootstrap, Bootstrap was suggesting a single link tag for everything, JS and CSS. Because of this recommendation, the CSS styles from Bootstrap were also coming from "https://cdn.jsdelivr.net". This means I needed to add "https://cdn.jsdelivr.net" to the "styleSrcUrls" array, which Colt only includes in the "scriptSrcUrls" array. We can also remove "https://stackpath.bootstrapcdn.com/" from the style array.
  "https://stackpath.bootstrapcdn.com/",
];
const connectSrcUrls = [
  "https://api.mapbox.com/",
  "https://a.tiles.mapbox.com/",
  "https://b.tiles.mapbox.com/",
  "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`, //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! //and I use my name in .env to found the imges
        "https://images.unsplash.com/",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);
// ==========passport===================
// they must be under session
//passport update and passport initialize doesn't exist yet but i just follow code colt
app.use(passport.initialize()); //It just tells us that we need that passport.Session middleware if we want persistent login sessions versus the alternative would be having to login on every single request,
//that meanis a middle-ware that initialises Passport.Intializes Passport for incoming requests, allowing authentication strategies to be applied.
app.use(passport.session()); //is another middleware that alters the request object and change the 'user' value that is currently the session id (from the client cookie) into the true deserialized user object.
// for more explain https://stackoverflow.com/questions/46644366/what-is-passport-initialize-nodejs-express/46645936#46645936
// https://stackoverflow.com/questions/22052258/what-does-passport-session-middleware-do/28994045#28994045
//you must know the passport.initialize() and passport.session()) .That all has to do with how information is stored and retrieved from the session anyway.

passport.use(new LocalStrategy(User.authenticate())); //So what we're saying here is that, hello, passports.We would like you to use the local strategy that we have downloaded and required.
//....And for that local strategy, the authentication method is going to be located on our user model andit's called authenticate.
//... we don't have method called authentication we made , but its come from But again, it's coming from this passport local mongoose
//authenticate() Generates a function that is used in Passport's LocalStrategy

passport.serializeUser(User.serializeUser()); //This is telling passports how to serialize a user.
//And serialization refers to basically how do we get data or how do we store a user in the session?
// that mean its Generates a function that is used by Passport to serialize users into the session

passport.deserializeUser(User.deserializeUser()); //How do you get a user out of that session?

// ========================middleware flash and passport =================
// I can't put it above because the currentUser debend on serializeUser and deserializer if you put it above them the currentUser will be undifine
app.use((req, res, next) => {
  //this for using flash every where
  console.log(req.query);
  res.locals.currentUser = req.user; //I explain it in middleware.js req.user ,the passport will deal with it
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  //i can use any of this variable in every where

  next();
});
//====================use router====================
app.use("/", campgroundsRouter);
app.use(reviewsRouter);
app.use(userRoutes);
// ================================== methods ==============================
// app.get("/fackUser", async (req, res) => {
//   const user = new User({
//     //in our Schema we have email and username do put more then email or username
//     email: "khatab@gmail.com",
//     username: "ks1",
//   });
//   const newUser = await User.register(user, "12345678"); //register(user, password, cb) Convenience method to register a new user instance with a given password.

//   res.send(newUser); //look it have hash and  salt and username  and email
// });

app.get("/", (req, res) => {
  res.render("home");
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Oh No, Something Went Wrong!";
  res.status(statusCode).render("error", { err });
});

app.listen(2023, () => {
  console.log("Serving on port 2023");
});
