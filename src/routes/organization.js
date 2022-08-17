const express = require('express');
const Multer = require('multer');
const userController = require('../controllers/organizations');
const { MAX_IMAGE_SIZE } = require('../utility/variables');

const multer = Multer({
    storage: Multer.memoryStorage(),
    limits: {
        fileSize: MAX_IMAGE_SIZE,
    },
});
const {
    PUT_ORGANIZATION_VALIDATION_RULES,
    handleValidation,
} = require('../utility/validation');

const router = express.Router();

router.put(
    '/',
    multer.single('coverImage'),
    PUT_ORGANIZATION_VALIDATION_RULES,
    handleValidation,
    userController.updateOrgProfile
);

module.exports = router;
