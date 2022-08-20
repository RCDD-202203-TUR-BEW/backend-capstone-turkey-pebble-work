const express = require('express');

const {
    ID_VALIDATION_RULE,
    handleValidation,
} = require('../utility/validation');

const router = express.Router();
const organizationsController = require('../controllers/organizations');

router.post(
    '/',
    ID_VALIDATION_RULE,
    handleValidation,
    organizationsController.addOrganizationSubscription
);

module.exports = router;
