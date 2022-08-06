const express = require('express');
const {
    GET_EVENTS_VALIDATION_RULES,
    DELETE_EVENT_VALIDATION_RULES,
    handleValidation,
} = require('../utility/validation');

const router = express.Router();
const eventsController = require('../controllers/events');
const { autherizationMiddleware } = require('../middleware');
const EventModel = require('../models/event');

router.get(
    '/',
    GET_EVENTS_VALIDATION_RULES,
    handleValidation,
    eventsController.getEvents
);

router.delete(
    '/:id',
    DELETE_EVENT_VALIDATION_RULES,
    handleValidation,
    autherizationMiddleware(EventModel),
    eventsController.deleteEvent
);

router.put(
    '/:id',
    autherizationMiddleware(EventModel),
    eventsController.updateEvent
);

module.exports = router;
