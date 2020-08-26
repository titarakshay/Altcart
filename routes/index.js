var express = require("express");
var router = express.Router();
var passport = require("passport");
var Product = require("../models/product");
var User = require("../models/user");
var auth = require("../middlewares/auth");
var flash = require("connect-flash");
var Cart = require("../models/cart");
var Item = require("../models/itemlist");
var Review = require("../models/review");

/* GET home page. */

router.get("/", async function (req, res, next) {
  try {
    let list = await Product.distinct("category");
    let products = await Product.find({}).sort({ createdAt: -1 });
    var cart = await Cart.findOne({ userId: req.user.id });
    var msg = req.flash("msg");
    if (req.session.userId) {
      res.redirect("/home");
    } else {
      res.render("home", { msg, list, products, cart });
    }
  } catch (error) {
    next(error);
  }
});

//checkout form
router.get("/:userid/checkout", async (req, res, next) => {
  try {
    let list = await Product.distinct("category");
    let products = await Product.find({}).sort({ createdAt: -1 });
    let cart = await Cart.findOne({ userId: req.user.id });
    let mycart = await Item.find({ cart: cart.id })
      .populate("item", "name price")
      .exec();
    var msg = req.flash("msg");
    console.log(mycart, "mycart");

    res.render("checkout", { list, products, mycart, cart, msg });
  } catch (error) {
    next(error);
  }
});
// router.get('/',async(req,res,next)=>{
//   try {
//     res.redirect("https://www.amazon.in/")
//   } catch (error) {
//     next(error);
//   }
// })

// get home page
router.get("/home", auth.logged, async (req, res, next) => {
  try {
    var cart = await Cart.findOne({ userId: req.user.id });
    var wishlist = await User.findById(req.params.userId);
    var list = await Product.distinct("category");
    if (!req.user.isVerified && !req.user.isAdmin) {
      var user = await User.findById(req.session.userId);

      req.flash("msg", "Verification code is send to your Register Email");
      var msg = req.flash("msg");
      res.render("verify", { user, cart, list, msg });
    } else {
      let products = await Product.find({}).sort({ createdAt: -1 });
      var msg = req.flash("msg");

      res.render("userhome", { products, msg, list, cart, wishlist });
    }
  } catch (error) {
    next(error);
  }
});

// single product details
router.get("/:productId", async (req, res, next) => {
  try {
    var user = await User.findById(req.user.id);
    let list = await Product.distinct("category");
    var cart = await Cart.findOne({ userId: req.user.id });
    let product = await Product.findById(req.params.productId)
      .populate({
        path: "reviews",
        populate: { path: "user", model: "User", select: "name id" },
      })
      .exec();
    var msg = req.flash("msg");
    res.render("product", { product, msg, list, cart, user });
  } catch (error) {
    next(error);
  }
});

// post by search

router.post("/search", async (req, res, next) => {
  try {
    let list = await Product.distinct("category");
    var cart = await Cart.findOne({ userId: req.user.id });
    var search = req.body.search;
    console.log(search);
    var products = await Product.find({ $text: { $search: search } });
    req.flash("msg", `results for ${search} `);
    var msg = req.flash("msg");
    res.render("filtered", { products, msg, list, cart });
  } catch (error) {
    next(error);
  }
});

// add to cart

router.post("/add/:productName", async (req, res, next) => {
  try {
    if (req.session.userId) {
      var product = req.params.productName.replace(/%20/g, "");
      var productName = await Product.findOne({ name: product });
      var cart = await Cart.findOne({ userId: req.user.id });

      if (productName.qty >= req.body.qty) {
        var item = await Item.findOne({ item: productName.id, cart: cart.id });
        console.log(item, "itme is here");

        if (!item) {
          req.body.item = productName.id;
          req.body.cart = cart.id;
          var item = await Item.create(req.body);
          console.log(item, "item  ala");
        } else {
          var updateditem = await Item.findByIdAndUpdate(
            item.id,
            {
              $inc: { qty: req.body.qty },
            },
            { new: true }
          );
          console.log(updateditem, "updated");
        }
        var cart = await Cart.findOneAndUpdate(
          { userId: req.user.id },
          { $addToSet: { itemList: item.id } },
          { new: true }
        );
        var product = await Product.findByIdAndUpdate(
          productName.id,
          { $inc: { qty: -req.body.qty } },
          { new: true }
        );
        req.flash("msg", "Add successfully");
        res.redirect(`/${productName.id}`);
      } else {
        req.flash("msg", "Not Enough Quantity");
        res.redirect("/home");
      }
    } else {
      req.flash("Error", "You need to login");
      res.redirect("/users/login");
    }
  } catch (error) {
    next(error);
  }
});

// increase your item qty
router.get("/qtyadd/:productid", async (req, res, next) => {
  try {
    if (req.session.userId) {
      var productName = await Product.findById(req.params.productid);

      var cart = await Cart.findOne({ userId: req.user.id });
      var item = await Item.findOne({ item: productName.id, cart: cart.id });

      var item = await Item.findByIdAndUpdate(item.id, { $inc: { qty: 1 } });
      var product = await Product.findByIdAndUpdate(
        productName.id,
        { $inc: { qty: -1 } },
        { new: true }
      );
      console.log(item, "user id");
      req.flash("msg", "Add successfully");

      res.redirect(`/${req.user.id}/mycart`);
    } else {
      req.flash("Error", "You need to login");
      res.redirect("/users/login");
    }
  } catch (error) {
    next(error);
  }
});

// decrement cart qty
router.get("/qtyminus/:productid", async (req, res, next) => {
  try {
    if (req.session.userId) {
      var productName = await Product.findById(req.params.productid);
      var cart = await Cart.findOne({ userId: req.user.id });
      console.log(cart.id, "cart id is here", productName.id);
      var item = await Item.findOne({ item: productName.id, cart: cart.id });
      var item = await Item.findByIdAndUpdate(item.id, { $inc: { qty: -1 } });
      var product = await Product.findByIdAndUpdate(
        productName.id,
        { $inc: { qty: 1 } },
        { new: true }
      );
      console.log(item, "user id");
      req.flash("msg", "Add successfully");
      res.redirect(`/${req.user.id}/mycart`);
    } else {
      req.flash("Error", "You need to login");
      res.redirect("/users/login");
    }
  } catch (error) {
    next(error);
  }
});

// get my cart
router.get("/:id/mycart", async (req, res, next) => {
  let list = await Product.distinct("category");

  var cart = await Cart.findOne({ userId: req.user.id });

  var mycart = await Item.find({ cart: cart.id })
    .populate("item", "name price image category")
    .exec();
  var msg = req.flash("msg");
  res.render("mycart", { mycart, list, cart, msg });
});

// remove from my cart
router.get("/:productId/deleteItem", async (req, res, next) => {
  try {
    productId = req.params.productId;
    var item = await Item.findById(productId);
    var product = await Product.findByIdAndUpdate(item.item, {
      $inc: { qty: item.qty },
    });
    var cart = await Cart.findByIdAndUpdate(item.cart, {
      $pull: { itemList: item.id },
    });
    var deleteItem = await Item.findByIdAndDelete(productId);
    res.redirect(`/${req.user.id}/mycart`);
  } catch (error) {
    next(error);
  }
});

// favorite item

router.get("/:productId/favorite", async (req, res, next) => {
  try {
    productId = req.params.productId;
    var user = await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { favoriteItems: productId },
    });
    req.flash("msg", "favorited successfully");
    res.redirect("/home");
  } catch (error) {
    next(error);
  }
});

// wishlist
router.get("/:userId/wishlist", async (req, res, next) => {
  try {
    let list = await Product.distinct("category");
    var cart = await Cart.findOne({ userId: req.user.id });
    var wishlist = await User.findById(req.params.userId)
      .populate("favoriteItems", "name price image category")
      .exec();
    var msg = req.flash("msg");
    res.render("wishlist", { wishlist, msg, list, cart });
  } catch (error) {
    next(error);
  }
});

// remove from favorite
router.get("/:productId/unfavorite", async (req, res, next) => {
  try {
    var user = await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { favoriteItems: req.params.productId } },
      { next: true }
    );
    req.flash("msg", "remove from wishlist Successfully");
    res.redirect(`/${req.user.id}/wishlist`);
  } catch (error) {
    next(error);
  }
});

// add reviews
router.post("/:productId/review", async (req, res, next) => {
  try {
    (req.body.productId = req.params.productId), (req.body.user = req.user.id);
    if (req.user) {
      var review = await Review.create(req.body);
      var product = await Product.findByIdAndUpdate(req.params.productId, {
        $addToSet: { reviews: review.id },
      });
      res.redirect(`/${req.params.productId}`);
    } else {
      req.flash("msg", "You must need to login");
      res.redirect(`/${req.params.productId}`);
    }
  } catch (error) {
    next(error);
  }
});

// like review
router.get("/:productId/:reviewId/like", async (req, res, next) => {
  try {
    var review = await Review.findByIdAndUpdate(req.params.reviewId, {
      $inc: { likes: 1 },
    });
    res.redirect(`/${req.params.productId}`);
  } catch (error) {
    next(error);
  }
});

//get edit review page
router.get("/:productId/reviews/:id/edit", async (req, res, next) => {
  try {
    let list = await Product.distinct("category");
    var cart = await Cart.findOne({ userId: req.user.id });
    var reviewId = req.params.id;
    var review = await Review.findById(reviewId);
    if (review.user == req.user.id) {
      res.render("editReview", { review, list, cart });
    } else {
      res.redirect(`/${req.params.productId}`);
    }
  } catch (error) {
    next(error);
  }
});

// post redited review
router.post("/reviews/:id/edit", async (req, res, next) => {
  try {
    var reviewId = req.params.id;
    var review = await Review.findByIdAndUpdate(reviewId, req.body);
    req.flash("msg", "Review Updated Successfully");
    res.redirect(`/${review.productId}`);
  } catch (error) {
    next(error);
  }
});

router.get("/:productId/reviews/:id/delete", async (req, res, next) => {
  try {
    let id = req.params.id;
    let review = await Review.findById(id);
    if (review.user == req.user.id) {
      let product = await Product.findByIdAndUpdate(
        review.productId,
        { $pull: { reviews: id } },
        { new: true }
      );
      let deletedcomment = await Review.findByIdAndDelete(id);
      req.flash("msg", "review deleted successfully");
      res.redirect(`/${req.params.productId}`);
    } else {
      res.redirect(`/${req.params.productId}`);
    }
  } catch (error) {
    next(error);
  }
});

// search by category
router.get("/search/:category", async (req, res, next) => {
  try {
    let list = await Product.distinct("category");
    var cart = await Cart.findOne({ userId: req.user.id });
    console.log(req.params.category, "mili search me");
    var products = await Product.find({ category: req.params.category });
    req.flash("msg", `results for ${req.params.category} `);
    var msg = req.flash("msg");
    res.render("filtered", { products, msg, list, cart });
  } catch (error) {
    next(error);
  }
});

// github passport
router.get("/auth/github", passport.authenticate("github"));

router.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/admin/allproducts");
  }
);
module.exports = router;
