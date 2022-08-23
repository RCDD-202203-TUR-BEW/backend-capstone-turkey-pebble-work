const express = require('express');
const authController = require('../controllers/auth');
const { passport } = require('../config/passport');

const router = express.Router();

router.get('/twitter', passport.authenticate('twitter', {}));

router.get(
    '/twitter/callback',
    passport.authenticate('google', {
        failureRedirect: '/api/auth/twitter',
        session: false,
    }),
    authController.saveTwitterUser
);

module.exports = router;
