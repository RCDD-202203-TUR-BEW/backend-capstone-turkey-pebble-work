const express = require('express');
const {
    DONATE_VALIDATION_RULES,
    handleValidation,
} = require('../utility/validation');
const fundsController = require('../controllers/funds');

const router = express.Router();

router.post(
    '/:id/donate',
    DONATE_VALIDATION_RULES,
    handleValidation,
    fundsController.donate
);

module.exports = router;
