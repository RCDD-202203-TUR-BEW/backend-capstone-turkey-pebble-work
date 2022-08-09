const express = require('express');
const {
    VERIFY_VALIDATION_FUND,
    VERIFY_VALIDATION_FUNDSBYID,
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
router.get(
    '/:id',
    VERIFY_VALIDATION_FUNDSBYID,
    handleValidation,
    fundsController.getOneFund
);
module.exports = router;
