const express = require('express');
const {
    VOLUNTEERS_EVENT_VALIDATION_RULES,
    handleValidation,
} = require('../utility/validation');

const router = express.Router();
const eventController = require('../controllers/events');

router.post(
    '/:id/volunteers',
    VOLUNTEERS_EVENT_VALIDATION_RULES,
    handleValidation,
    eventController.joinedVolunteers
);

module.exports = router;
