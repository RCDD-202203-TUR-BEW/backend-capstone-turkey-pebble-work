const express = require('express');
const {
    GET_EVENTS_VALIDATION_RULES,
    handleValidation,
} = require('../utility/validation');

const router = express.Router();
const eventsController = require('../controllers/events');

router.get(
    '/',
    GET_EVENTS_VALIDATION_RULES,
    handleValidation,
    eventsController.getEvents
);

module.exports = router;
