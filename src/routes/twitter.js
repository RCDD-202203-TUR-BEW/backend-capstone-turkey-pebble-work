const express = require('express');
const authController = require('../controllers/auth');
const { passport } = require('../config/passport');

const router = express.Router();

router.get(
    '/twitter',
    passport.authenticate('twitter', { scope: ['profile', 'email', 'openid'] })
);

router.get(
    '/twitter/callback',
    passport.authenticate('twitter', {
        failureRedirect: '/api/twitter-auth/twitter',
        session: false,
    }),
    authController.saveTwitterUser
);

module.exports = router;
