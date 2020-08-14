var express = require("express");
var router = express.Router();
var User = require("../models/user");
var Product = require("../models/product");
var flash = require("connect-flash");
var Cart = require("../models/cart");
var nodemailer = require("nodemailer");
var smtpTransport = require("nodemailer-smtp-transport");

/* GET users listing. */

// verify user mail
router.post("/:userId/verify", async (req, res, next) => {
  try {
    var user = await User.findById(req.params.userId);

    console.log(user.code == req.body.code);
    if (req.body.code == user.code) {
      var updateuser = await User.findByIdAndUpdate(user.id, {
        isVerified: true,
      });
      console.log(updateuser, "update");
      res.redirect("/home");
    } else {
      req.flash("msg", "Wrong verification code");
      res.redirect("/home");
    }
  } catch (error) {
    next(error);
  }
});

// change password code verify
router.post("/:userId/code", async (req, res, next) => {
  try {
    var user = await User.findById(req.params.userId);
    let list = await Product.distinct("category");
    var cart = await Cart.findOne({ userId: req.user.id });

    if (req.body.code == user.code) {
      res.render("password", { user, list, cart });
    } else {
      req.flash("msg", "Wrong verification code");
      res.redirect("/");
    }
  } catch (error) {
    next(error);
  }
});
// post change password
router.post("/:userId/password", async (req, res, next) => {
  try {
    console.log(req.body);
    var user = await User.findById(req.params.userId);
    var updated = await user.changepassword(req.body.password);
    var updateduser = await User.findOneAndUpdate(user.id, {
      password: updated,
    });
    req.flash("msg", "Password updated ");
    res.redirect("/");
  } catch (error) {
    next(error);
  }
});

// get register page
router.get("/register", async function (req, res, next) {
  let list = await Product.distinct("category");
  var cart = await Cart.findOne({ userId: req.user.id });

  var msg = req.flash("msg");
  res.render("register", { msg, list, cart });
});

router.post("/register", async (req, res, next) => {
  try {
    console.log(req.body);

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
      to: req.body.email,
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
    req.body.code = code;
    var user = await User.create(req.body);
    var cart = await Cart.create({ userId: user.id });
    var user = await User.findByIdAndUpdate(
      user.id,
      { $addToSet: { cart: cart.id } },
      { new: true }
    );
    req.session.userId = user.id;

    res.redirect("/home");
  } catch (error) {
    next(error);
  }
});

// get login page
router.get("/login", async (req, res, next) => {
  try {
    let list = await Product.distinct("category");
    let cart = { itemList: 0 };

    var msg = req.flash("msg");
    res.render("login", { list, msg, cart });
  } catch (error) {
    next(error);
  }
});

// post on login
router.post("/login", async (req, res, next) => {
  try {
    var { email, password } = req.body;
    User.findOne({ email }, (err, user) => {
      if (err) return next(err);
      if (!user) {
        req.flash("msg", "Wrong Email");
        return res.redirect("/users/login");
      }
      if (!user.verify(password)) {
        req.flash("msg", "Wrong Password");
        return res.redirect("/users/login");
      }
      if (user.block) {
        req.flash("msg", "Your account is block");
        return res.redirect("/users/login");
      }
      req.session.userId = user.id;
      req.flash("msg", "Welcome To Shopping Cart");
      res.redirect("/home");
    });
  } catch (error) {
    next(error);
  }
});

router.get("/forgot", async (req, res, next) => {
  try {
    let list = await Product.distinct("category");
    var cart = await Cart.findOne({ userId: req.user.id });
    res.render("forgot", { list, cart });
  } catch (error) {
    next(error);
  }
});

router.post("/forgot", async (req, res, next) => {
  try {
    let list = await Product.distinct("category");
    console.log(req.body);
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
      to: req.body.email,
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
    req.body.code = code;
    var user = await User.findOneAndUpdate(
      { email: req.body.email },
      { code: req.body.code }
    );
    res.render("code", { user, list });
  } catch (error) {
    next(error);
  }
});

router.get("/logout", async (req, res, next) => {
  try {
    req.session.destroy();
    res.redirect("/");
  } catch (error) {
    next(error);
  }
});
module.exports = router;
