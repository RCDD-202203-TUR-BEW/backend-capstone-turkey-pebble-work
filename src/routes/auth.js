const express = require('express');
const Multer = require('multer');
const authController = require('../controllers/auth');
const { passport } = require('../config/passport');

const {
    ORGANIZATION_SIGNUP_VALIDATION_RULES,
    USER_SIGNUP_VALIDATION_RULES,
    VERIFY_VALIDATION_RULES,
    SIGNIN_VALIDATION_RULES,
    handleValidation,
} = require('../utility/validation');

const router = express.Router();
const { MAX_IMAGE_SIZE } = require('../utility/variables');

const multer = Multer({
    storage: Multer.memoryStorage(),
    limits: {
        fileSize: MAX_IMAGE_SIZE,
    },
});

const APIs = [
    {
        route: '/organization/signup',
        method: 'post',
        multer: multer.single('coverImage'),
        controller: passport.authenticate,
        validation: ORGANIZATION_SIGNUP_VALIDATION_RULES,
    },
    {
        route: '/user/signup',
        method: 'post',
        multer: multer.single('profileImage'),
        controller: authController.signUp,
        validation: USER_SIGNUP_VALIDATION_RULES,
    },
    {
        route: '/verify/:id/:token',
        method: 'get',
        controller: authController.verifyBaseUserEmail,
        validation: VERIFY_VALIDATION_RULES,
    },
    {
        route: '/signin',
        method: 'post',
        controller: authController.signIn,
        validation: SIGNIN_VALIDATION_RULES,
    },
    {
        route: '/signout',
        method: 'get',
        controller: authController.signOut,
    },
];

APIs.forEach((api) => {
    router[api.method](
        api.route,
        api.multer || ((req, res, next) => next()),
        api.validation || [],
        handleValidation,
        api.controller
    );
});
router.get(
    '/google',
    passport.authenticate('google', { scope: ['profile', 'email', 'openid'] })
);

router.get(
    '/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/api/auth/google',
        session: false,
    }),
    authController.saveGoogleUser
);

router.get('/signout', authController.signOut);

module.exports = router;
