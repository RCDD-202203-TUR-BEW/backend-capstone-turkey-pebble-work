const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const { User } = require('../models/user');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    const USER = await User.findById(id);
    done(null, USER);
});

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.OAUTH2_CLIENT_ID,
            clientSecret: process.env.OAUTH2_CLIENT_SECRET,
            callbackURL: `${process.env.BASE_URL}/api/google-auth/google/callback`,
        },
        async (accessToken, refreshToken, profile, cb) => {
            try {
                cb(null, profile);
            } catch (err) {
                cb(err, null);
            }
        }
    )
);

passport.use(
    new TwitterStrategy(
        {
            consumerKey: process.env.OAUTH2_CONSUMER_KEY,
            consumerSecret: process.env.OAUTH2_CONSUMER_SECRET,
            callbackURL: `${process.env.BASE_URL}/api/twitter-auth/twitter/callback`,
            includeEmail: true,
        },
        async (accessToken, refreshToken, profile, cb) => {
            try {
                cb(null, profile);
            } catch (err) {
                cb(err, null);
            }
        }
    )
);

module.exports = {
    passport,
};
