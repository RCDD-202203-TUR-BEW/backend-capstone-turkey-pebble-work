const express = require('express');

const userController = require('../controllers/organizations');
const {
    GET_ORGANIZATION_VALIDATION_RULES,

    handleValidation,
} = require('../utility/validation');

const router = express.Router();

router.get(
    '/:id',
    GET_ORGANIZATION_VALIDATION_RULES,
    handleValidation,
    userController.getOrgProfile
);

module.exports = router;
