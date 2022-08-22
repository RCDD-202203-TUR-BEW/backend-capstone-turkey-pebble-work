const express = require('express');

const {
    ID_VALIDATION_RULE,
    handleValidation,
} = require('../utility/validation');

const router = express.Router();
const organizationsController = require('../controllers/organizations');

router.patch(
    '/',
    ID_VALIDATION_RULE,
    handleValidation,
    organizationsController.addOrganizationSubscription
);

module.exports = router;
