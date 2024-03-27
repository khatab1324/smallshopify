const User = require("../models/user");

module.exports.renderRegister = (req, res) => {
  res.render("users/register");
};

module.exports.register = async (req, res) => {
  try {
    //i want when there something went wrong like using same username , i want falsh message show to user becuase that I use try and catch
    const { username, email, password } = req.body;
    const user = new User({ email, username });
    const newUser = await User.register(user, password); //open app.js look for method called fackUser I explain User.register there
    console.log(newUser);
    //now after the user register ,we automaticly let him longin
    req.login(newUser, (err) => {
      if (err) {
        //that impassiple to get err at this point becuase you are successfully signUp but maby
        return next(err);
      }
      // you should put the redirect inside login
      req.flash("success", "welcome in yelp camp");
      res.redirect("/campgrounds");
    });
    // Log In
    // Passport exposes a login() function on req (also aliased as logIn()) that can be used to establish a login session.
    // req.login(user, function(err) {
    //   if (err) { return next(err); }
    //   return res.redirect('/users/' + req.user.username);
    // });
    // When the login operation completes, user will be assigned to req.user.
    // Note: passport.authenticate() middleware invokes req.login() automatically. This function is primarily used when users sign up, during which req.login() can be invoked to automatically log in the newly registered user.
  } catch (error) {
    req.flash("error", error.message);
    res.redirect("/register");
  }
};

module.exports.renderLogin = (req, res) => {
  res.render("users/login");
};

module.exports.login = (req, res) => {
  req.flash("success", "welcome back!");
  console.log(req.session.returnTo);
  const redirectUrl = res.locals.returnTo || "/campgrounds"; //if the req.session.returnTo is not define let the redirctUrl ecual campgrounds
  // in 529 show you how to fix the redirect issue very very important
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
  //here we use call pack
  req.logout(function (err) {
    //logout its come with passport
    if (err) {
      return next(err);
    }
    req.flash("success", "Goodbye!");
    res.redirect("/campgrounds");
  });
};
