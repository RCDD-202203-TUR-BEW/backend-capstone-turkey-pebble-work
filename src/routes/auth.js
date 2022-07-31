const express = require('express');
const Multer = require('multer');

const authController = require('../controllers/auth');
const {
    ORGANIZATION_SIGNUP_VALIDATION_RULES,
    USER_SIGNUP_VALIDATION_RULES,
    VERIFY_VALIDATION_RULES,
    SIGNIN_VALIDATION_RULES,
    handleValidation,
} = require('../utility/validation');

const MAX_IMAGE_SIZE = 1024 * 1024 * 10; // 10MB

const router = express.Router();
const multer = Multer({
    storage: Multer.memoryStorage(),
    limits: {
        fileSize: MAX_IMAGE_SIZE,
    },
});

router.post(
    '/organization/signup',
    multer.single('coverImage'),
    ORGANIZATION_SIGNUP_VALIDATION_RULES,
    handleValidation,
    authController.signUp
);

router.post(
    '/user/signup',
    multer.single('profileImage'),
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
