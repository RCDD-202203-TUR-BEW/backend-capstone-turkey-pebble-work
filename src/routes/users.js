const express = require('express');
const userController = require('../controllers/users');

const {
    GET_ORGANIZATION_VALIDATION_RULES,
    handleValidation,
} = require('../utility/validation');

const router = express.Router();

router.get('/user', userController.getUserProfile);
router.get(
    '/organization/:id',
    GET_ORGANIZATION_VALIDATION_RULES,
    handleValidation,
    userController.getOrgProfile
);
router.put('/user', userController.updateUserProfile);

module.exports = router;
