const { validationResult, param, query, body } = require('express-validator');
const { isString } = require('lodash');
const variables = require('./variables');

const BASE_USER_VALIDATION_RULES = [
    body('email').exists().isEmail().withMessage('email is required'),
    body('password')
        .exists()
        .isString()
        .isStrongPassword({
            min: 8,
            minLowercase: 0,
            minUppercase: 0,
            minNumbers: 0,
            minSymbols: 0,
        })
        .withMessage(
            'password is required and most be longer than 8 characters'
        ),
];

const USER_SIGNUP_VALIDATION_RULES = [
    ...BASE_USER_VALIDATION_RULES,
    body('firstName').exists().isString().withMessage('firstName is required'),
    body('lastName').exists().isString().withMessage('lastName is required'),
    body('profileImage')
        .exists()
        .isString()
        .withMessage('profileImage is required'),
    body('dateOfBirth')
        .exists()
        .isDate() // example: '2000-01-01'
        .withMessage('dateOfBirth is required'),
    body('preferredCities')
        .optional()
        .isArray({ min: 1 })
        .withMessage('preferredCities must be an unempty array')
        .custom((array) =>
            array.every(
                (city) => isString(city) && variables.CITIES.includes(city)
            )
        )
        .withMessage('preferredCities must be an array of valid cities'),
    body('interests')
        .optional()
        .isArray({ min: 1 })
        .withMessage('interests must be an unempty array')
        .custom((array) =>
            array.every(
                (interest) =>
                    isString(interest) &&
                    variables.CATEGORIES.includes(interest)
            )
        )
        .withMessage('interests must be an array of valid interests'),
    body('gender')
        .exists()
        .isString()
        .custom((value) => ['male', 'female', 'other'].includes(value))
        .withMessage('gender must be a valid string'),
];

const ORGANIZATION_SIGNUP_VALIDATION_RULES = [
    ...BASE_USER_VALIDATION_RULES,
    body('name').exists().isString().withMessage('name is required'),
    body('description')
        .exists()
        .isString()
        .withMessage('description is required'),
    body('coverImage').exists().isString().withMessage('logo is required'),
    body('categories')
        .optional()
        .isArray({ min: 1 })
        .withMessage('interests must be an unempty array')
        .custom((array) =>
            array.every(
                (category) =>
                    isString(category) &&
                    variables.CATEGORIES.includes(category)
            )
        )
        .withMessage('interests must be an array of valid interests'),
    body('city')
        .exists()
        .isString()
        .custom((city) => variables.CITIES.includes(city))
        .withMessage('city is required'),
    body('websiteUrl')
        .optional()
        .isString()
        .withMessage('websiteUrl is required'),
];

const VERIFY_VALIDATION_RULES = [
    param('id').exists().isString().withMessage('id is required'),
    param('token').exists().isString().withMessage('token is required'),
];

const SIGNIN_VALIDATION_RULES = [
    body('email').exists().isEmail().withMessage('email is required'),
    body('password').exists().isString().withMessage('password is required'),
];

const VERIFY_VALIDATION_FUND = [
    query('baseUserId').optional().isString(),
    query('category')
        .optional()
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
    USER_SIGNUP_VALIDATION_RULES,
    ORGANIZATION_SIGNUP_VALIDATION_RULES,
    VERIFY_VALIDATION_RULES,
    SIGNIN_VALIDATION_RULES,
    VERIFY_VALIDATION_FUND,
    handleValidation,
};
