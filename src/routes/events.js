const express = require('express');

const Multer = require('multer');
const { MAX_IMAGE_SIZE } = require('../utility/variables');

const {
    GET_EVENTS_VALIDATION_RULES,
    GET_EVENT_ID_VALIDATION_RULES,
    DELETE_EVENT_VALIDATION_RULES,
    PUT_EVENT_VALIDATION_RULES,
    VOLUNTEERS_EVENT_VALIDATION_RULES,
    CREATE_EVENT_VALIDATION_RULES,
    handleValidation,
} = require('../utility/validation');

const router = express.Router();
const eventsController = require('../controllers/events');
const { autherizationMiddleware } = require('../middleware');
const EventModel = require('../models/event');

const multer = Multer({
    storage: Multer.memoryStorage(),
    limits: {
        fileSize: MAX_IMAGE_SIZE,
    },
});

router.get(
    '/',
    GET_EVENTS_VALIDATION_RULES,
    handleValidation,
    eventsController.getEvents
);

router.get(
    '/:id',
    GET_EVENT_ID_VALIDATION_RULES,
    handleValidation,
    eventsController.getEventById
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
    multer.single('coverImage'),
    PUT_EVENT_VALIDATION_RULES,
    handleValidation,
    autherizationMiddleware(EventModel),
    eventsController.updateEvent
);

router.post(
    '/:id/invite-volunteer',
    VOLUNTEERS_EVENT_VALIDATION_RULES,
    handleValidation,
    autherizationMiddleware(EventModel),
    eventsController.inviteVolunteer
);
router.post(
    '/:id/volunteers',
    VOLUNTEERS_EVENT_VALIDATION_RULES,
    handleValidation,
    eventsController.joinedVolunteers
);

router.post(
    '/',
    multer.single('coverImage'),
    CREATE_EVENT_VALIDATION_RULES,
    handleValidation,
    eventsController.createEvent
);

module.exports = router;
