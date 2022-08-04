const express = require('express');

const router = express.Router();

const eventsController = require('../controllers/events');

router.get('/:id', eventsController.getOneEvent);

module.exports = { router };
