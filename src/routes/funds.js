const express = require('express');
const {
    VERIFY_VALIDATION_FUND,
    handleValidation,
} = require('../utility/validation');

const router = express.Router();

const fundsController = require('../controllers/funds');
/**
 * @swagger
 * /funds:
 *   get:
 *     summary: Returns all posts
 *     tags: [Funds]
 *     responses:
 *       200:
 *         description: the list of the posts
 */
router.get(
    '/',
    VERIFY_VALIDATION_FUND,
    handleValidation,
    fundsController.getFunds
);
module.exports = router;
