const express = require('express');
const {
    handleValidation,
    POST_RATE_VALIDATION_RULES,
    DELETE_RATE_VALIDATION_RULES,
} = require('../utility/validation');

const router = express.Router();

const organizationController = require('../controllers/organizations');

router.post(
    '/:id/rate',
    POST_RATE_VALIDATION_RULES,
    handleValidation,
    organizationController.rate
);

router.delete(
    '/:id/rate',
    DELETE_RATE_VALIDATION_RULES,
    handleValidation,
    organizationController.deleteRate
);

module.exports = router;
