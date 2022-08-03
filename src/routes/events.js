const express = require('express');
const {
    EVENT_VALIDATION_RULES,
    handleValidation,
} = require('../utility/validation');

const router = express.Router();
const eventController = require('../controllers/events');

router.post(
    '/:id/join',
    EVENT_VALIDATION_RULES,
    handleValidation,
    eventController.joinedVoulnteers
);

module.exports = router;
