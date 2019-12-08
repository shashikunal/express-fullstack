const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const bcrypt = require("bcrypt");

const router = express.Router();

require("../Model/User");
const Users = mongoose.model("users");

//routes
router.get("/login", (req, res) => {
  res.render("auth/login", { title: "login page" });
});
router.get("/register", (req, res) => {
  res.render("auth/register", { title: "Register page" });
});

//post request
router.post("/register", (req, res) => {
  const errors = [];
  if (req.body.password != req.body.confirmpassword) {
    errors.push({ text: "Password is not match" });
  }
  if (req.body.password.length < 4) {
    errors.push({
      text: "Password must be atleast 4 characters"
    });
  }

  if (errors.length > 0) {
    res.render("auth/register", {
      errors: errors,
      name: req.body.name,
      email: req.body.password,
      password: req.body.password,
      confirmpassword: req.body.confirmpassword
    });
  } else {
    Users.findOne({ email: req.body.email })
      .then(user => {
        if (user) {
          req.flash("error_msg", "Email is already exits...📧");
          res.redirect("/auth/register");
        } else {
          const newUser = new Users({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
          });

          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (err) throw err;
              newUser.password = hash;
              newUser
                .save()
                .then(user => {
                  req.flash("success_msg", "successfully user registered");
                  res.redirect("/auth/login");
                })
                .catch(err => console.log(err));
            });
          });
        }
      })
      .catch(err => console.log(err));
  }
});

//login post request
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/posts/posts",
    failureRedirect: "/auth/login",
    failureFlash: true
  })(req, res, next);
});

router.get("/logout", (req, res) => {
  req.logOut();
  req.flash("success_msg", "Successfully logout...");
  res.redirect("/auth/login");
});

module.exports = router;
