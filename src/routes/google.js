const express = require('express');
const authController = require('../controllers/auth');
const { passport } = require('../config/passport');

const router = express.Router();

router.get(
    '/google',
    passport.authenticate('google', {
        scope: ['profile', 'email', 'openid'],
    })
);

router.get(
    '/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/api/auth/google',
        session: false,
    }),
    authController.saveUserToTokenAndCookie
);

module.exports = router;
