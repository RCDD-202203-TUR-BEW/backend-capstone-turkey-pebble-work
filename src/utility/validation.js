const { validationResult, query } = require('express-validator');
const { isString } = require('lodash');
const mongoose = require('mongoose');
const variables = require('./variables');

const VERIFY_VALIDATION_FUND = [
    query('publisherId')
        .optional()
        .isString()
        .custom((value) => {
            console.log(mongoose.Types.ObjectId.isValid(value));
            return mongoose.Types.ObjectId.isValid(value);
        }),
    query('category').optional(),
    .isArray({ min: 1 })
    .withMessage('interests must be an unempty array')
    .custom((array) =>
        array.every(
            (category) =>
                isString(category) &&
                variables.CATEGORIES.includes(category)
        )
    ),
    query('lastDate')
        .optional()
        .isDate() // example: '2000-01-01'
        .withMessage('Enter a valid date'),
    query('currentDate')
        .optional()
        .isDate() // example: '2000-01-01'
        .withMessage('Enter a valid date')
        .custom((currentDte, { req }) => {
            const currentDate = new Date(currentDte);
            const lastDate = new Date(req.body.lastDate);
            return currentDate > lastDate;
        })
        .withMessage('Current date must be after last date'),
];

const handleValidation = (req, res, next) => {
    const validationResults = validationResult(req);
    if (!validationResults.isEmpty()) {
        res.status(422).json({ errors: validationResults.array() });
        res.end();
    } else {
        next();
    }
};

module.exports = {
    VERIFY_VALIDATION_FUND,
    handleValidation,
};
