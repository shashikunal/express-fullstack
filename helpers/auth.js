module.exports = {
  ensureAuthenticated: function(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    } else {
      req.flash("error_msg", "You are not Authorized user please login 😃");
      res.redirect("/auth/login");
    }
  }
};
