var User = require("../models/user");
var Admin=require("../models/admin")
exports.logged = (req, res, next) => {
  if (req.session.userId || req.session.passport) {
    return next();
  } else {
    req.flash('msg',"You need Login")
    return res.redirect("/");
  }
};

exports.userInfo = (req, res, next) => {
  if (req.session.passport) {
    req.session.userId = req.session.passport.user;

    Admin.findById(
      req.session.userId,
      { email: 1, name: 1, userId: 1,isVerified:1,isAdmin:1},
      (err, user) => {
        if (err) return next(err);
        req.user = user;
        res.locals.userInfo = user;
        next();
      }
    );
  } else if (req.session.userId) {
    User.findById(
      req.session.userId,
      { email: 1, name: 1, userId: 1,image:1 ,isVerified:1,isAdmin:1},
      (err, user) => {
        if (err) return next(err);
        req.user = user;
        res.locals.userInfo = user;

        next();
      }
    );
  } else {
    req.user = '';
    res.locals.userInfo = '';
    next();
  }
};
