if (process.env.NODE_ENV !== "production") {
  //if we are in development mode it will work
  require("dotenv").config();
}
// =================require laibaryes===============
const express = require("express");
const mongoose = require("mongoose");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const session = require("express-session");
const MongoStore = require("connect-mongo");
//when you require connect-mongo for store session use the last version and read some doc pleas don't follow colt code that will cause errors for you there fix in leture number 586 is not huge
const multer = require("multer");
const methodOverride = require("method-override");
// const mongoSanitize = require("express-mongo-sanitize"); //mongoSanitize is a module that sanitizes user-supplied data to prevent MongoDB Operator Injection.
// const helmet = require("helmet"); //Helmet helps you secure your Express apps by setting various HTTP headers. It's not a silver bullet, but it can help!
//====================for ejs======================
const path = require("path");
const ejsMate = require("ejs-mate");
// ================================================
const app = express();
// ==============require files ====================
const User = require("./models/users");
const storeRouter = require("./routers/stores");
const authenticateRouter = require("./routers/authantication");
const controleRouter = require("./routers/controleStore");
const accountRouter = require("./routers/account");
const productRouter = require("./routers/product");
const reviewRouter = require("./routers/review");
const payRouter = require("./routers/pay");
const { log } = require("console");
const dbUrl = process.env.DB_URL || "mongodb://127.0.0.1:27017/smallshopify";
mongoose.set("strictQuery", false); //DeprecationWarning: Mongoose: the `strictQuery` option will be switched back to `false` by default in Mongoose 7. Use `mongoose.set('strictQuery', false);` if you want to prepare for this change. Or use `mongoose.set('strictQuery', true);` to suppress this warning.
mongoose
  .connect(dbUrl, {
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
app.engine("ejs", ejsMate);
// =========================session====================

const storeSession = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60,
  crypto: {
    secret: "thisshouldbeabettersecret!",
  },
});
storeSession.on("error", function (e) {
  console.log("session store error", e);
});
const secret = process.env.SECRET || "thisshouldbeabettersecret!";
const sessionConfig = {
  name: "session",
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    //  secure:true;//Basically, it says that this cookie should only work over https.
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //this number is week long//this becuase Date.now its number like this 1688917466197
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

app.use(flash());
// ======================passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ========================using flash====================
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});
//=======================use helmet======================
// app.use(mongoSanitize());
// app.use(helmet({ contentSecurityPolicy: true }));

// const scriptSrcUrls = [
//   //here I allow jsut this secript to use if you use another ones it will not shown to you
//   "https://stackpath.bootstrapcdn.com/",
//   "https://kit.fontawesome.com",
//   "https://kit.fontawesome.com/805e959fd5.js",
//   "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css",
//   "https://cdnjs.cloudflare.com/",
//   "//maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css",
//   "https://cdn.jsdelivr.net",
//   // call fontawesome
//   "https://fonts.googleapis.com/",
// ];
// const styleSrcUrls = [
//   "https://kit-free.fontawesome.com/",
//   "https://fonts.googleapis.com/",
//   "https://use.fontawesome.com",
//   "https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.2/css/fontawesome.min.css",
//   "https://use.fontawesome.com/releases/v5.8.1/css/all.css",
//   ,
//   "https://www.dcnewsnow.com/wp-content/uploads/sites/14/2022/08/GettyImages-1133980246.jpg?strip=1",
//   "//maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css",
//   "https://ka-f.fontawesome.com/releases/v6.5.1/css/free.min.css",
//   "https://kit.fontawesome.com/805e959fd5.js",
//   "https://cdn.jsdelivr.net", //By the time I got to implementing Bootstrap, Bootstrap was suggesting a single link tag for everything, JS and CSS. Because of this recommendation, the CSS styles from Bootstrap were also coming from "https://cdn.jsdelivr.net". This means I needed to add "https://cdn.jsdelivr.net" to the "styleSrcUrls" array, which Colt only includes in the "scriptSrcUrls" array. We can also remove "https://stackpath.bootstrapcdn.com/" from the style array.
//   "https://stackpath.bootstrapcdn.com/",
// ];
// const fontSrcUrls = [
//   "https://fonts.gstatic.com",
//   "https://kit-free.fontawesome.com",
// ];

// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: ["self"],
//       scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
//       styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
//       workerSrc: ["'self'", "blob:"],
//       imgSrc: [
//         "'self'",
//         "blob:",
//         "data:",
//         "https://yt3.googleusercontent.com/vWyhCklj-SWS-hJOpYiVfHlHB49Lk-uIKLdtEhbt-FZ4PGQodc_tC7sr6Ww1o7tf_1hfIwfPng=s900-c-k-c0x00ffffff-no-rj",
//         "https://cdn.techjuice.pk/wp-content/uploads/2019/07/online-shopping.jpg",
//         ,
//         "https://www.dcnewsnow.com/wp-content/uploads/sites/14/2022/08/GettyImages-1133980246.jpg?strip=1",
//         `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`, //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! //and I use my name in .env to found the imges
//         "https://images.unsplash.com/",
//       ],
//       fontSrc: ["'self'", ...fontSrcUrls],
//     },
//   })
// );
// =====================use router===============
app.use(authenticateRouter);
app.use(storeRouter);
app.use(controleRouter);
app.use(accountRouter);
app.use(productRouter);
app.use(reviewRouter);
app.use(payRouter);
app.get("/", (req, res) => {
  res.render("home");
});

app.use((err, req, res, next) => {
  console.log("errrrrr", err);
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Oh No, Something Went Wrong!";
  res.status(statusCode).render("error", { err });
});

port = 2004;
app.listen(port, () => {
  console.log(`lets get started in port ${port}`);
});
