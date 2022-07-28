const express = require('express');
const authController = require('../controllers/auth');
const {
    ORGANIZATION_SIGNUP_VALIDATION_RULES,
    USER_SIGNUP_VALIDATION_RULES,
    VERIFY_VALIDATION_RULES,
    SIGNIN_VALIDATION_RULES,
    handleValidation,
} = require('../utility/validation');

const router = express.Router();

router.post(
    '/organization/signup',
    ORGANIZATION_SIGNUP_VALIDATION_RULES,
    handleValidation,
    authController.signUp
);

router.post(
    '/user/signup',
    USER_SIGNUP_VALIDATION_RULES,
    handleValidation,
    authController.signUp
);

router.get(
    '/verify/:id/:token',
    VERIFY_VALIDATION_RULES,
    handleValidation,
    authController.verifyBaseUserEmail
);

router.post(
    '/signin',
    SIGNIN_VALIDATION_RULES,
    handleValidation,
    authController.signIn
);

router.get('/signout', authController.signOut);

module.exports = router;
