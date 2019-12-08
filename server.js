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

const multer = require("multer");
HandlebarsIntl.registerWith(Handlebars);

require("./Model/Post");

const app = express();

//handlebars

Handlebars.registerHelper("trimString", function(passedString) {
  var theString = [...passedString].splice(6).join("");
  return new Handlebars.SafeString(theString);
});

//load postSchema

const Posts = mongoose.model("posts");

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
app.use(express.static(path.join(__dirname, "public")));

//template engine
app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");

//multer middleware

var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + file.originalname);
  }
});

var upload = multer({ storage: storage });

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

app.use(flash());

//global messages
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

//routing
app.get("/", (req, res) => {
  res.render("home.handlebars");
});

app.get("/posts/addposts", (req, res) => {
  res.render("posts/addposts");
});
//edit posts
app.get("/posts/editpost/:id", (req, res) => {
  Posts.findOne({
    _id: req.params.id
  }).then(post => {
    res.render("posts/editpost", {
      post: post
    });
  });
});

app.get("/posts/posts", (req, res) => {
  Posts.find({})
    .sort({ date: "desc" })

    .then(post => {
      res.render("posts/posts", {
        post: post,
        title: "Posts page"
      });
    })
    .catch(err => console.log(err));
});

//post request
app.post("/posts/addposts", upload.single("photo"), (req, res, next) => {
  //upload file

  // var fileinfo = req.file;
  // var title = req.body.title;
  // var details = req.body.details;
  // console.log(title, details);
  // res.send(fileinfo);

  const errors = [];
  if (!req.body.title) {
    errors.push({ text: "Title field is Required" });
  }
  if (!req.body.details) {
    errors.push({ text: "details field is Required" });
  }
  if (errors.length > 0) {
    res.render("posts/addposts", {
      errors: errors,
      title: req.body.title,
      details: req.body.details
    });
  } else {
    const newPosts = {
      photo: req.file,
      title: req.body.title,
      details: req.body.details
    };

    new Posts(newPosts)
      .save()
      .then(post => {
        console.log(post);
        req.flash("success_msg", "successfully post Added💩");
        res.redirect("/posts/posts");
      })
      .catch(err => console.log(err));
  }
});

//edit post put request
app.put("/posts/editpost/:id", (req, res) => {
  //save new data to database
  Posts.findOne({
    _id: req.params.id
  })
    .then(post => {
      post.title = req.body.title;
      post.details = req.body.details;

      post.save().then(post => {
        req.flash("success_msg", "successfully post Updated😃");
        res.redirect("/posts/posts");
      });
    })
    .catch(err => console.log(err));
});

//delete post request
app.delete("/posts/deletepost/:id", (req, res) => {
  Posts.remove({
    _id: req.params.id
  })
    .then(_ => {
      req.flash("success_msg", "successfully Post Deleted 😡");
      res.redirect("/posts/posts");
    })
    .catch(err => console.log(err));
});

app.get("**", (req, res) => {
  res.render("404.handlebars");
});

const port = process.env.PORT || 7000;
app.listen(port, err => {
  if (err) throw err;
  else console.log("Server is running on port Number " + port);
});
