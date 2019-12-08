const express = require("express");
const mongoose = require("mongoose");
var exphbs = require("express-handlebars");
const path = require("path");
const bodyParser = require("body-parser");
var Handlebars = require("handlebars");
var HandlebarsIntl = require("handlebars-intl");
var methodOverride = require("method-override");
var session = require("express-session");
var flash = require("connect-flash");
var passport = require("passport");

HandlebarsIntl.registerWith(Handlebars);
const app = express();

//passport

require("./config/passport")(passport);

//handlebars

Handlebars.registerHelper("trimString", function(passedString) {
  var theString = [...passedString].splice(6).join("");
  return new Handlebars.SafeString(theString);
});

//load post routes

const posts = require("./Routes/posts");

//load auth routes
const auth = require("./Routes/auth");

//connection mongodb
const mongodbUrl =
  "mongodb+srv://jspiders:shashi123@cluster0-trwtz.mongodb.net/test?retryWrites=true&w=majority";
mongoose.connect(
  mongodbUrl,
  {
    useUnifiedTopology: true,
    useNewUrlParser: true
  },
  err => {
    if (err) throw err;
    console.log("database connected");
  }
);

//method override middleware
// override with the X-HTTP-Method-Override header in the request
// app.use(methodOverride("X-HTTP-Method-Override"));
// override with POST having ?_method=DELETE
app.use(methodOverride("_method"));

//serve static files
app.use(express.static(path.join(__dirname + "/public")));

//template engine
app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");

//multer middleware

//bodyparser middlewares
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

//express session
app.use(
  session({
    secret: "keyboard cat",
    resave: true,
    saveUninitialized: true
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

//global messages
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.user = req.user || null;
  next();
});

app.get("/", (req, res) => {
  res.render("home.handlebars");
});

app.use("/posts", posts);
app.use("/auth", auth);

app.get("**", (req, res) => {
  res.render("404.handlebars");
});

const port = process.env.PORT || 7000;
app.listen(port, err => {
  if (err) throw err;
  else console.log("Server is running on port Number " + port);
});
