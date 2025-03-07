const express = require('express');
const router = express.Router();

router.get('/dashboard', (req, res) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.redirect('/login');
  }
  res.render('dashboard', { user: req.user });
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true
  })(req, res, next);
});

router.get('/event', (req, res) => {
  res.redirect('/event');
});

module.exports = router;
