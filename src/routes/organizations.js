const express = require('express');

const {
    ID_VALIDATION_RULE,
    POST_RATE_VALIDATION_RULES,
    DELETE_RATE_VALIDATION_RULES,
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

router.post(
    '/:id/rate',
    POST_RATE_VALIDATION_RULES,
    handleValidation,
    organizationsController.rate
);

router.delete(
    '/:id/rate',
    DELETE_RATE_VALIDATION_RULES,
    handleValidation,
    organizationsController.deleteRate
);

module.exports = router;
