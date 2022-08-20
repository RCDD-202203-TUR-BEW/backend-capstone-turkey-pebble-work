const express = require('express');

const { handleValidation } = require('../utility/validation');

const router = express.Router();
const OrganizationsController = require('../controllers/organizations')


router.post('/', handleValidation, OrganizationsController.addOrganizationSubscription)