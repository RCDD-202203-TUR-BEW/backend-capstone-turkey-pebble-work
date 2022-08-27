const express = require('express');
const Multer = require('multer');

const organizationController = require('../controllers/organizations');
const orgaController = require('../controllers/organizations');
const { MAX_IMAGE_SIZE } = require('../utility/variables');

const {
    VERIFY_VALIDATION_FUNDSBYID,
    PUT_ORGANIZATION_VALIDATION_RULES,
    POST_RATE_VALIDATION_RULES,
    DELETE_RATE_VALIDATION_RULES,
    GET_ORGANIZATION_VALIDATION_RULES,
    handleValidation,
} = require('../utility/validation');

const multer = Multer({
    storage: Multer.memoryStorage(),
    limits: {
        fileSize: MAX_IMAGE_SIZE,
    },
});

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

router.put(
    '/',
    multer.single('coverImage'),
    PUT_ORGANIZATION_VALIDATION_RULES,
    handleValidation,
    orgaController.updateOrgProfile
);

router.post(
    '/:id/rate',
    POST_RATE_VALIDATION_RULES,
    handleValidation,
    orgaController.rate
);

router.delete(
    '/:id/rate',
    DELETE_RATE_VALIDATION_RULES,
    handleValidation,
    orgaController.deleteRate
);

router.delete(
    '/:id/sub',
    VERIFY_VALIDATION_FUNDSBYID,
    handleValidation,
    organizationController.unFollowOrga
);

module.exports = router;
