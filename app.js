var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var session = require("express-session");
var passport = require("passport");
var multer = require("multer");
var flash = require("connect-flash");
var auth = require("./middlewares/auth");
var MongoStore = require("connect-mongo")(session);

//dot env
require("dotenv").config();

//require passport
require("./modules/passport");

//database connection
mongoose.connect(
  "mongodb+srv://akshay:akshay@cluster0.e8w39.mongodb.net/altcart?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  },
  (err) => {
    console.log("connected", err ? err : true);
  }
);

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var adminRouter = require("./routes/admin");
var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// session create
app.use(
  session({
    secret: "keyboard cat",
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    resave: false,
    saveUninitialized: true,
  })
);

//passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());
app.use(auth.userInfo);
app.use("/admin", auth.logged, adminRouter);
app.use("/", indexRouter);
app.use("/users", usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  if (err.name == "MongoError") {
    req.flash("Error", "Email is already Exist");
    res.redirect("/users/register");
  }
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
