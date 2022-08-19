const express = require('express');

const userController = require('../controllers/users');
const {
    GET_USER_VALIDATION_RULES,
    handleValidation,
} = require('../utility/validation');

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

module.exports = router;
