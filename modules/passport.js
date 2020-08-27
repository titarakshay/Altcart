var passport = require("passport");
var Githubstrategy = require("passport-github").Strategy;
var flash = require("connect-flash");
var Admin = require("../models/admin");

passport.use(
  new Githubstrategy(
    {
      clientID: process.env.ClientID,
      clientSecret: process.env.Client_Secret,
      callbackURL: "https://altcart-app.herokuapp.com/auth/github/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      if (profile._json.email == "titarakshay@gmail.com") {
        // user create or find
        Admin.findOne({ githubId: profile.id }, (err, user) => {
          if (user) {
            return done(err, user);
          }
          if (!user) {
            Admin.create(
              {
                githubId: profile.id,
                email: profile._json.email,
                name: profile.displayName,
                image: profile._json.avatar_url,
              },
              (err, user) => {
                return done(err, user);
              }
            );
          }
        });
      } else {
        Admin.findOne({ githubId: profile.id }, (err, user) => {
          return done(err, user);
        });
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});
