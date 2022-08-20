const express = require('express');

const { handleValidation } = require('../utility/validation');

const router = express.Router();
const UsersController = require('../controllers/users');

router.post('/', handleValidation, UsersController.addUserSubscription);
