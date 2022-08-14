const express = require('express');
const FundModel = require('../models/fund');
const { autherizationMiddleware } = require('../middleware');
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
    fundsController.getSingleFund
);
router.delete(
    '/:id/delete',
    VERIFY_VALIDATION_FUNDSBYID,
    handleValidation,
    autherizationMiddleware(FundModel),
    fundsController.deleteFund
);

module.exports = router;
