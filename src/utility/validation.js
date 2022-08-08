const { validationResult, param, body, query } = require('express-validator');
const { isString, parseInt } = require('lodash');
const { default: mongoose } = require('mongoose');
const variables = require('./variables');

const { MAX_IMAGE_SIZE } = require('./variables');

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
        .custom((value, { req }) => {
            // image is optional
            if (!req.file) return true;
            if (
                req.file.mimetype.split('/')[0] !== 'image' ||
                req.file.size > MAX_IMAGE_SIZE
            ) {
                return false;
            }
            return true;
        })
        .withMessage('profileImage must be an image less than 10MB'),
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
    body('coverImage')
        .custom((value, { req }) => {
            // image is optional
            if (!req.file) return true;
            if (
                req.file.mimetype.split('/')[0] !== 'image' ||
                req.file.size > MAX_IMAGE_SIZE
            ) {
                return false;
            }
            return true;
        })
        .withMessage('coverImage must be an image less than 10MB'),
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
    param('id')
        .exists()
        .isString()
        .custom((value) => mongoose.Types.ObjectId.isValid(value))
        .withMessage('A valid id is required'),
    param('token').exists().isString().withMessage('token is required'),
];

const SIGNIN_VALIDATION_RULES = [
    body('email').exists().isEmail().withMessage('email is required'),
    body('password').exists().isString().withMessage('password is required'),
];

const GET_EVENTS_VALIDATION_RULES = [
    query('categories')
        .optional()
        .isArray({ min: 1 })
        .withMessage('categories must be an unempty array')
        .custom((array) =>
            array.every(
                (category) =>
                    isString(category) &&
                    variables.CATEGORIES.includes(category)
            )
        )
        .withMessage('categories must be an array of valid categories'),
    query('city')
        .optional()
        .isString()
        .withMessage('city must be a string')
        .custom((city) => variables.CITIES.includes(city))
        .withMessage('valid city is required'),
    query('from')
        .optional()
        .isInt({ min: 0 })
        .withMessage('"from" must be an integer')
        .custom((value, { req }) => req.query.to) // false if 'to' is not set
        .withMessage('cannot set "from" without "to"')
        .custom((value, { req }) => parseInt(value) < parseInt(req.query.to))
        .withMessage('"from" must be less than "to"'),
    query('to')
        .optional()
        .isInt({ min: 1 })
        .withMessage('"to" must be an integer')
        .custom((value, { req }) => req.query.to)
        .withMessage('cannot set "to" without "from"')
        .custom((value, { req }) => parseInt(value) > parseInt(req.query.from))
        .withMessage('"to" must be greater than "from"'),
    query('fromDate')
        .optional()
        .isDate()
        .withMessage('fromDate must be a valid date')
        .custom((value, { req }) => req.query.toDate)
        .withMessage('cannot set "fromDate" without "toDate"')
        .custom(
            (value, { req }) => new Date(value) <= new Date(req.query.toDate)
        )
        .withMessage('"fromDate" must be less than or equal to "toDate"'),
    query('toDate')
        .optional()
        .isDate()
        .withMessage('toDate must be a valid date')
        .custom((value, { req }) => req.query.toDate)
        .withMessage('cannot set "toDate" without "fromDate"')
        .custom(
            (value, { req }) => new Date(value) >= new Date(req.query.fromDate)
        )
        .withMessage('"toDate" must be greater than or equal to "fromDate"'),
    query('publisherId')
        .optional()
        .isString()
        .custom((publisherId) => mongoose.Types.ObjectId.isValid(publisherId))
        .withMessage('publisherId must be a valid id'),
];

const CREATE_FUND_VALIDATION_RULES = [
    body('title').exists().isString().isLength({ max: 50 }).withMessage('title is required'),
    body('content').exists().isString().isLength({ max: 1000 }).withMessage('content is required'),
    body('deadline').exists().isDate().withMessage('deadline is required'),
    body('targetFund').exists().isInt().withMessage('targetFund is required'),
    body('categories')
        .exists()
        .isArray({ min: 1 })
        .withMessage('categories must be an unempty array')
        .custom((array) =>
            array.every(
                (category) =>
                    isString(category) &&
                    variables.CATEGORIES.includes(category)
            )
        )
        .withMessage('categories must be an array of valid categories'),
    body('city').exists().isString()
        .custom((city) => variables.CITIES.includes(city))
        .withMessage('city is required'),
    body('country').exists().isString().isLength({ max: 20 }).withMessage('country is required'),
    body('addressLine').exists().isString().isLength({ max: 50 }).withMessage('addressLine is required'),
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
    GET_EVENTS_VALIDATION_RULES,
    handleValidation,
};
