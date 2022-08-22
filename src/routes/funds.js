const express = require('express');
const FundModel = require('../models/fund');
const { autherizationMiddleware } = require('../middleware');
const {
    VERIFY_VALIDATION_FUND,
    VERIFY_VALIDATION_FUNDSBYID,
    DONATE_VALIDATION_RULES,
    PUT_FUND_VALIDATION_RULES,
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
    '/:id',
    VERIFY_VALIDATION_FUNDSBYID,
    handleValidation,
    autherizationMiddleware(FundModel),
    fundsController.deleteFund
);
router.post(
    '/:id/donate',
    DONATE_VALIDATION_RULES,
    handleValidation,
    fundsController.donate
);

router.put(
    '/:id',
    PUT_FUND_VALIDATION_RULES,
    autherizationMiddleware(FundModel),
    handleValidation,
    fundsController.updateFund
);

module.exports = router;
