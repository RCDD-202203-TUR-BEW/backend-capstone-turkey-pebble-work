const express = require('express');
const {
    VERIFY_VALIDATION_FUND,
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
module.exports = router;
