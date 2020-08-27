var passport = require("passport");
var Githubstrategy = require("passport-github").Strategy;
var flash = require("connect-flash");
var Admin = require("../models/admin");
var Cart = require("../models/cart");
var nodemailer = require("nodemailer");
var smtpTransport = require("nodemailer-smtp-transport");

passport.use(
  new Githubstrategy(
    {
      clientID: process.env.ClientID,
      clientSecret: process.env.Client_Secret,
      callbackURL: "https://altcart-app.herokuapp.com/auth/github/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      if (profile._json.email === "titarakshay@gmail.com") {
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
        var code = Math.floor(Math.random() * 1000000);
        var transporter = nodemailer.createTransport(
          smtpTransport({
            service: "gmail",
            host: "smtp.gmail.com",
            auth: {
              user: process.env.Gmail_username,
              pass: process.env.Gmail_password,
            },
          })
        );

        var mailOptions = {
          from: process.env.Gmail_username,
          to: profile._json.email,
          subject: `Verification code is ${code}`,
          text: `Verification code is ${code}`,
        };

        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log("Email sent: " + info.response);
          }
        });

        var user = await User.create({
          email: profile._json.email,
          name: profile.displayName,
          image: profile._json.avatar_url,
          code: code,
        });
        var cart = await Cart.create({ userId: user.id });
        var user = await User.findByIdAndUpdate(
          user.id,
          { $addToSet: { cart: cart.id } },
          { new: true },
          (err, user) => {
            return done(err, user);
          }
        );
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
