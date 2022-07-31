const express = require('express')
const router = express.Router()
const eventController = require('../controllers/events')



router.post('/events', eventController.createEvent)


