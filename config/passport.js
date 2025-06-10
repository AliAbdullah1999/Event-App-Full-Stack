const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('../models/User');

module.exports = function(passport) {
    passport.use(new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true
    }, async (req, username, password, done) => {
        try {
            // Try to find user by username or email
            const user = await User.findOne({
                $or: [
                    { username: username.toLowerCase() },
                    { email: username.toLowerCase() }
                ]
            });
            
            if (!user) {
                return done(null, false, { message: 'Invalid username or email.' });
            }

            const isMatch = await bcrypt.compare(password, user.passwordHash);
            if (!isMatch) {
                return done(null, false, { message: 'Invalid password.' });
            }

            return done(null, user);
        } catch (err) {
            console.error('Login error:', err);
            return done(err);
        }
    }));

    passport.serializeUser((user, done) => {
        try {
            done(null, user.id);
        } catch (err) {
            console.error('Serialize error:', err);
            done(err);
        }
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id).select('-passwordHash');
            if (!user) {
                return done(null, false);
            }
            done(null, user);
        } catch (err) {
            console.error('Deserialize error:', err);
            done(err);
        }
    });
};
