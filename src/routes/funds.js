const express = require('express');
const router = express.Router();
const fundsController = require('../controllers/funds');
const {
    CREATE_FUND_VALIDATION_RULES,
    handleValidation,
} = require('../utility/validation');

router.post('/', CREATE_FUND_VALIDATION_RULES, handleValidation, fundsController.createFund)

module.exports = router 
 