// routes/auth.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");
const passport = require('passport');
const flash = require('connect-flash'); // Add this line

// Middleware to use flash messages
router.use(flash()); // Add this line

// Render the login form
router.get("/login", (req, res) => {
  res.render("login", { messages: req.flash('success') });
});

// Render the registration form
router.get("/register", (req, res) => {
  res.render("register", { messages: req.flash('error') });
});

// Handle registration logic
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    req.flash('error', 'All fields are required.');
    return res.redirect("/register");
  }
  try {
    // Check if the email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash('error', 'Email is already registered.');
      return res.redirect("/register");
    }

    // Hash the password
    const hash = await bcrypt.hash(password, 10);
    // Create a new user document
    const user = new User({ username, email, passwordHash: hash });
    await user.save();
    req.flash('success', 'Registration successful. Please log in.');
    res.redirect("/login");
  } catch (err) {
    console.error(err);
    req.flash('error', 'An error occurred. Please try again.');
    res.redirect("/register");
  }
});

// Handle login logic
router.post('/login', passport.authenticate('local', {
  successRedirect: '/events',  // Redirect to events page on success
  failureRedirect: '/login',
  failureFlash: true
}));

module.exports = router;
