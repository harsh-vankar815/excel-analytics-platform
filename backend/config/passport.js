const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const config = require('./config');

// Passport serialization/deserialization
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: config.GOOGLE_CLIENT_ID,
      clientSecret: config.GOOGLE_CLIENT_SECRET,
      callbackURL: `${config.BACKEND_URL}/api/auth/google/callback`,
      scope: ['profile', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          return done(null, user);
        }

        // If not, check if user exists with the same email
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : '';
        user = await User.findOne({ email });

        if (user) {
          // If user exists with email but not googleId, update the user
          user.googleId = profile.id;
          await user.save();
          return done(null, user);
        }

        // Create new user
        const newUser = await User.create({
          name: profile.displayName,
          email: email,
          googleId: profile.id,
          password: Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8) // Random password as it's not used
        });

        return done(null, newUser);
      } catch (error) {
        console.error('Google OAuth error:', error);
        return done(error, false);
      }
    }
  )
);

module.exports = passport; 