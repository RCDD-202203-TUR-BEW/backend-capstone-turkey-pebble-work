const express = require('express');
const {
    VERIFY_VALIDATION_FUND,
    DONATE_VALIDATION_RULES,
    handleValidation,
} = require('../utility/validation');

const router = express.Router();

const fundsController = require('../controllers/funds');

router.get(
    '/',
    VERIFY_VALIDATION_FUND,
    handleValidation,
    fundsController.getFunds
);

router.post(
    '/:id/donate',
    DONATE_VALIDATION_RULES,
    handleValidation,
    fundsController.donate
);

module.exports = router;
