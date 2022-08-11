const express = require('express')
const router = express.Router()
const Multer = require('multer');
const eventController = require('../controllers/events')
const { MAX_IMAGE_SIZE } = require('../utility/variables');
const { CREATE_EVENT_VALIDATION_RULES, handleValidation } = require('../utility/validation')

const multer = Multer({
    storage: Multer.memoryStorage(),
    limits: {
        fileSize: MAX_IMAGE_SIZE,
    },
});

router.post('/', multer.single('coverImage'), CREATE_EVENT_VALIDATION_RULES, handleValidation, eventController.createEvent)

module.exports = router
