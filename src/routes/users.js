const express = require('express');
const Multer = require('multer');

const userController = require('../controllers/users');
const { MAX_IMAGE_SIZE } = require('../utility/variables');

const {
    PUT_USER_VALIDATION_RULES,
    GET_USER_VALIDATION_RULES,
    handleValidation,
} = require('../utility/validation');

const multer = Multer({
    storage: Multer.memoryStorage(),
    limits: {
        fileSize: MAX_IMAGE_SIZE,
    },
});

const router = express.Router();

// User Public profile
router.get(
    '/:id',
    GET_USER_VALIDATION_RULES,
    handleValidation,
    userController.getUserPublicProfile
);

// User Private profile
router.get('/', userController.getUserPrivateProfile);

router.put(
    '/',
    multer.single('profileImage'),
    PUT_USER_VALIDATION_RULES,
    handleValidation,
    userController.updateUserProfile
);

module.exports = router;
