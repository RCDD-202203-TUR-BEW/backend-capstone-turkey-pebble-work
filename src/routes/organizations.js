const express = require('express');
const Multer = require('multer');

const userController = require('../controllers/organizations');
const organizationController = require('../controllers/organizations');
const { MAX_IMAGE_SIZE } = require('../utility/variables');

const multer = Multer({
    storage: Multer.memoryStorage(),
    limits: {
        fileSize: MAX_IMAGE_SIZE,
    },
});
const {
    handleValidation,
    VERIFY_VALIDATION_FUNDSBYID,
    PUT_ORGANIZATION_VALIDATION_RULES,
    POST_RATE_VALIDATION_RULES,
    DELETE_RATE_VALIDATION_RULES,
} = require('../utility/validation');

const router = express.Router();

router.put(
    '/',
    multer.single('coverImage'),
    PUT_ORGANIZATION_VALIDATION_RULES,
    handleValidation,
    userController.updateOrgProfile
);

router.post(
    '/:id/rate',
    POST_RATE_VALIDATION_RULES,
    handleValidation,
    organizationController.rate
);

router.delete(
    '/:id/rate',
    DELETE_RATE_VALIDATION_RULES,
    handleValidation,
    organizationController.deleteRate
);

router.delete(
    '/:id/sub',
    VERIFY_VALIDATION_FUNDSBYID,
    handleValidation,
    organizationController.unFollowOrga
);

module.exports = router;
