const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");

//load healper
const { ensureAuthenticated } = require("../helpers/auth");

//multer
var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + file.originalname);
  }
});

var upload = multer({ storage: storage });

//load post schama model

require("../Model/Post");
const Posts = mongoose.model("posts");

//routing

router.get("/addposts", ensureAuthenticated, (req, res) => {
  res.render("posts/addposts");
});
//edit posts
router.get("/editpost/:id", ensureAuthenticated, (req, res) => {
  Posts.findOne({
    _id: req.params.id
  }).then(post => {
    if (post.user != req.user.id) {
      req.flash("error_msg", "you are not Authorized");
      res.redirect("/posts/posts");
    }
    res.render("posts/editpost", {
      post: post
    });
  });
});

router.get("/posts", ensureAuthenticated, (req, res) => {
  Posts.find({ user: req.user.id })
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
router.post(
  "/addposts",
  ensureAuthenticated,
  upload.single("photo"),
  (req, res, next) => {
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
        details: req.body.details,
        user: req.user.id
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
  }
);

//edit post put request
router.put("/editpost/:id", ensureAuthenticated, (req, res) => {
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
router.delete("/deletepost/:id", ensureAuthenticated, (req, res) => {
  Posts.remove({
    _id: req.params.id
  })
    .then(_ => {
      req.flash("success_msg", "successfully Post Deleted 😡");
      res.redirect("/posts/posts");
    })
    .catch(err => console.log(err));
});

module.exports = router;
