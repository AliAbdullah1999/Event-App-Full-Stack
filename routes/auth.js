// routes/auth.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");
const passport = require('passport')
//Render the login form
router.get("/login", (req, res) => {
  res.render("login");
});
// Render the registration form
router.get("/register", (req, res) => {
  res.render("register");
});

// Handle registration logic
router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    // Hash the password
    const hash = await bcrypt.hash(password, 10);
    // Create a new user document
    const user = new User({ username, passwordHash: hash });
    await user.save();
    res.redirect("/login");
  } catch (err) {
    console.error(err);
    res.redirect("/register");
  }
});
//handle login logic
router.post('/login', passport.authenticate('local', {
    successRedirect: '/events',  // Redirect to event page on success
    failureRedirect: '/login',   // Redirect back to login on failure
    failureFlash: true
}));
module.exports = router;
