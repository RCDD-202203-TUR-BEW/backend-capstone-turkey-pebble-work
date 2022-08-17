const express = require('express');
const Multer = require('multer');
const userController = require('../controllers/users');
const { MAX_IMAGE_SIZE } = require('../utility/variables');

const multer = Multer({
    storage: Multer.memoryStorage(),
    limits: {
        fileSize: MAX_IMAGE_SIZE,
    },
});
const {
    PUT_USER_VALIDATION_RULES,
    PUT_ORGANIZATION_VALIDATION_RULES,
    handleValidation,
} = require('../utility/validation');

const router = express.Router();

router.put(
    '/user',
    multer.single('profileImage'),
    PUT_USER_VALIDATION_RULES,
    handleValidation,
    userController.updateUserProfile
);
router.put(
    '/organization',
    multer.single('coverImage'),
    PUT_ORGANIZATION_VALIDATION_RULES,
    handleValidation,
    userController.updateOrgProfile
);

module.exports = router;
