// app.js
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const helmet = require('helmet');
const morgan = require('morgan');
const flash = require('connect-flash');

const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/event-app')
.then(() => console.log('MongoDB connected'))
.catch(err => console.error(err));

const app = express();
const dashboardRoute = require('./routes/dashboard');

// Set view engine (using EJS)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: false
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// Passport Local Strategy using MongoDB
passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    const user = await User.findOne({ username });
    if (!user) return done(null, false, { message: 'Incorrect username.' });
    
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return done(null, false, { message: 'Incorrect password.' });
    
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Use Routers
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/event');

app.use('/', authRoutes);
app.use('/events', eventRoutes);
app.use('/auth', authRoutes); // Add this line
app.use('/', dashboardRoute);

// Home route (for example)
app.get('/', (req, res) => {
  res.render('index');
});

// Register route
app.get('/register', (req, res) => {
  const messages = req.flash('error');
  res.render('register', { messages });
});

app.post('/auth/register', (req, res) => {
  // ...existing code...
  const error = false; // Replace with actual error checking logic
  if (error) {
    req.flash('error', 'Registration failed');
    return res.redirect('/register');
  }
  // ...existing code...
  res.redirect('/success'); // Replace with actual success redirect
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
