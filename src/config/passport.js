const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
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
            callbackURL: 'http://localhost:3000/api/auth/google/callback',
        },
        async (accessToken, refreshToken, profile, cb) => {
            try {
                // const user = await User.findOne({
                //     providerId: `google-${profile.id}`,
                // });
                // console.log();
                // if (!user) {
                //     user = await User.create({
                //         email: profile.emails[0].value,
                //         firstName: profile.name.givenName,
                //         lastName: profile.name.familyName,
                //         profileImage: profile.photos[0].value,
                //         provider: 'google',
                //         providerId: `google-${profile.id}`,
                //     });
                // }
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
