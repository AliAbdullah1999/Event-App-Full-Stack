// routes/auth.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");
const passport = require('passport');
const flash = require('connect-flash');

// Middleware to use flash messages
router.use(flash());

// Render the login form
router.get("/login", (req, res) => {
    res.render("login", { 
        messages: {
            error: req.flash('error'),
            success: req.flash('success')
        }
    });
});

// Render the registration form
router.get("/register", (req, res) => {
    res.render("register", { 
        messages: {
            error: req.flash('error'),
            success: req.flash('success')
        }
    });
});

// Handle registration logic
router.post("/register", async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;

    try {
        // Validation
        if (!username || !email || !password) {
            req.flash('error', 'All fields are required.');
            return res.redirect("/register");
        }

        if (password !== confirmPassword) {
            req.flash('error', 'Passwords do not match.');
            return res.redirect("/register");
        }

        if (password.length < 6) {
            req.flash('error', 'Password must be at least 6 characters long.');
            return res.redirect("/register");
        }

        // Check if username or email already exists
        const existingUser = await User.findOne({
            $or: [
                { email: email.toLowerCase() },
                { username: username.toLowerCase() }
            ]
        });

        if (existingUser) {
            req.flash('error', 'Username or email is already registered.');
            return res.redirect("/register");
        }

        // Hash the password
        const hash = await bcrypt.hash(password, 10);
        
        // Create a new user
        const user = new User({
            username: username.toLowerCase(),
            email: email.toLowerCase(),
            passwordHash: hash
        });

        await user.save();
        req.flash('success', 'Registration successful! Please log in.');
        res.redirect("/login");
    } catch (err) {
        console.error('Registration error:', err);
        req.flash('error', 'An error occurred during registration. Please try again.');
        res.redirect("/register");
    }
});

// Handle login logic
router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            console.error('Login error:', err);
            req.flash('error', 'An error occurred during login. Please try again.');
            return res.redirect('/login');
        }

        if (!user) {
            req.flash('error', info.message || 'Invalid credentials.');
            return res.redirect('/login');
        }

        req.logIn(user, (err) => {
            if (err) {
                console.error('Login error:', err);
                req.flash('error', 'An error occurred during login. Please try again.');
                return res.redirect('/login');
            }

            return res.redirect('/events');
        });
    })(req, res, next);
});

// Logout route
router.get('/logout', (req, res) => {
    req.logout(function(err) {
        if (err) {
            console.error('Logout error:', err);
            return next(err);
        }
        req.flash('success', 'You have been logged out successfully.');
        res.redirect('/login');
    });
});

module.exports = router;
