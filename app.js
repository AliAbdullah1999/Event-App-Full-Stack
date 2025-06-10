// app.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const mongoose = require('mongoose');
const helmet = require('helmet');
const morgan = require('morgan');
const flash = require('connect-flash');
const cors = require('cors');
const { apiLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');

const User = require('./models/User');

// Connect to MongoDB
const dbURI = "mongodb://localhost:27017/eventapp";
mongoose.connect(dbURI)
  .then(() => {
    console.log("Connected to MongoDB");
    // Start the server only after the connection is established
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
  });

const app = express();
const dashboardRoute = require('./routes/dashboard');

// Initialize database connection
require('./config/database')();

// Passport config
require('./config/passport')(passport);

// Security Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? process.env.ALLOWED_ORIGINS : '*',
    credentials: true
}));

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// General middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback_secret_change_this',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Global variables middleware
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

// Rate limiting
app.use('/api', apiLimiter);

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/events', require('./routes/event'));
app.use('/', require('./routes/dashboard'));

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

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
    res.status(404).render('error/404');
});

module.exports = app;
