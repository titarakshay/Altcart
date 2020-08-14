var express = require("express");
var router = express.Router();
var passport = require("passport");
var Product = require("../models/product");
var User = require("../models/user");
var auth = require("../middlewares/auth");
var multer = require("multer");
var path = require("path");
var flash = require("connect-flash");
var Cart = require("../models/cart");
var Item = require("../models/itemlist");
var Review = require("../models/review");
var Category=require('../models/categories')

// multer disk storage
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, "../public/uploads/"));
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    },
  });
  
  var upload = multer({ storage: storage });

// get admin page 

router.get('/',async(req,res,next)=>{
    try {
      let list = await Product.distinct("category");
      console.log(req.session,"session is here")
        res.render('admin/adminPage',{list})
    } catch (error) {
        next(error);
    }
})

// get all products
router.get("/allproducts",async (req,res,next)=>{
    try {
        let list = await Product.distinct("category");
      let products = await Product.find({});
      var msg = req.flash("msg");
      res.render('admin/allproducts',{products,list,msg})
    } catch (error) {
        next(error)
    }
})

// get add category
router.get('/addcategory',async(req,res,next)=>{
  try {
    if(req.user.isAdmin){
      let list = await Product.distinct("category");
      res.render('admin/addcategory',{list})
    }else{
      res.redirect('/users/login')
    }
  } catch (error) {
    next(error);
  }
})

//post add category
router.post('/addcategory', async(req,res,next)=>{
  try {
    console.log(req.body)
    var category= await Category.create(req.body);
    console.log(category,"is found");
    req.flash('msg','Category Added successfully')
    res.redirect('/admin/allproducts')
    
  } catch (error) {
    next(error);
  }
})

//get add products page
router.get("/add", async (req, res) => {
    try {
      let categories= await Category.find({});
      console.log(categories,"all")
      let list = await Product.distinct("category");
      if (req.user.isAdmin) {
        res.render("admin/add",{list,categories});
      } else {
        req.flash("msg", "you are not admin");
        res.redirect("/");
      }
    } catch (error) {
      next(error);
    }
  });
  
  //post add products
  router.post("/add", upload.single("image"), async (req, res, next) => {
    try {
      if (req.user.isAdmin) {
        if(req.file){

          req.body.image = req.file.filename;
        }else{
          req.body.image="saveimage.jpeg"
        }
        var product = await Product.create(req.body);
      } else {
        req.flash("msg", "You are not admin");
      }
      res.redirect("/admin/allproducts");
    } catch (error) {
      next(error);
    }
  });

// get userlist
router.get("/userlist", async (req, res, next) => {
    try {
      if(req.user.isAdmin){
      let list = await Product.distinct("category");
      var users = await User.find({}, { name: 1, email: 1, block: 1 });
      res.render("admin/userlist", { users,list });
      }else{
        
        req.flash("msg", "you are not admin");
        res.redirect("/");
      }
    } catch (error) {
      next(error);
    }
  });
  
  // get user block
  router.get("/:userId/block", async (req, res, next) => {
    try {
      var user = await User.findByIdAndUpdate(req.params.userId, { block: true });
      res.redirect("/admin/userlist");
    } catch (error) {
      next(error);
    }
  });
  
  // get user unblock
  router.get("/:userId/unblock", async (req, res, next) => {
    try {
      var user = await User.findByIdAndUpdate(req.params.userId, {
        block: false,
      });
      res.redirect("/admin/userlist");
    } catch (error) {
      next(error);
    }
  });


// edit product
router.get("/:productId/edit", async (req, res, next) => {
    try {
      if(req.user.isAdmin){
      let list = await Product.distinct("category");
      productId = req.params.productId;
      var product = await Product.findById(productId);
      res.render("admin/editproduct", { product,list });
      }else{
        req.flash("msg", "you are not admin");
        res.redirect("/");
      }
    } catch (error) {
      next(error);
    }
  });
  
  // post edited product
  router.post(
    "/:productId/edit",
    upload.single("image"),
    async (req, res, next) => {
      try {
        productId = req.params.productId;
        if(req.file){

          req.body.image = req.file.filename;
        }
        var product = await Product.findByIdAndUpdate(productId, req.body);
        req.flash("msg", `${product.name} updated successfully`);
        res.redirect("/admin/allproducts");
      } catch (error) {
        next(error);
      }
    }
  );
  // delete product from site
  router.get("/:productId/delete", async (req, res, next) => {
    try {
      if(req.user.isAdmin){
      productId = req.params.productId;
      var product = await Product.findByIdAndDelete(productId);
      var review = await Review.deleteMany({ productId: productId });
      var item = await Item.findOneAndDelete({ item: product.id });
      if (item) {
        var cart = await Cart.findByIdAndUpdate(item.cart, {
          $pull: { itemList: item.id },
        });
      }
      req.flash("msg", "Product deleted successfully");
      res.redirect("/admin/allproducts");
    }else{
        req.flash("msg", "you are not admin");
        res.redirect("/");
      }
    } catch (error) {
      next(error);
    }
  });
  
  
module.exports=router;