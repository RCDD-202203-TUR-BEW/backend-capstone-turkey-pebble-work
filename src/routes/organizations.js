const express = require('express');

const orgaController = require('../controllers/organizations');
const {
    GET_ORGANIZATION_VALIDATION_RULES,
    handleValidation,
} = require('../utility/validation');

const router = express.Router();

// Organization Public profile
router.get(
    '/:id',
    GET_ORGANIZATION_VALIDATION_RULES,
    handleValidation,
    orgaController.getOrgPublicProfile
);
// Organization Private profile
router.get('/', orgaController.getOrgPrivateProfile);

module.exports = router;
