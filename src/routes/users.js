const express = require('express');

const {
    ID_VALIDATION_RULE,
    handleValidation,
} = require('../utility/validation');

const router = express.Router();
const usersController = require('../controllers/users');

router.patch(
    '/:id/sub',
    ID_VALIDATION_RULE,
    handleValidation,
    usersController.addUserSubscription
);

module.exports = router;
