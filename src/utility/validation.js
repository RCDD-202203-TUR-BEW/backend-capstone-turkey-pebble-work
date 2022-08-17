/* eslint-disable arrow-body-style */
const { validationResult, param, body, query } = require('express-validator');
const { isString, parseInt } = require('lodash');
const { default: mongoose } = require('mongoose');
const variables = require('./variables');
const { MAX_IMAGE_SIZE } = require('./variables');

const GET_EVENT_ID_VALIDATION_RULES = [
    param('id')
        .exists()
        .withMessage('Event id is required')
        .isString()
        .custom((value) => mongoose.Types.ObjectId.isValid(value))
        .withMessage('Event id must be a valid ObjectId'),
];

const VERIFY_VALIDATION_FUND = [
    query('publisherId')
        .optional()
        .isString()
        .custom((value) => mongoose.Types.ObjectId.isValid(value)),
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
const VERIFY_VALIDATION_FUNDSBYID = [
    param('id')
        .exists()
        .isString()
        .custom((value) => mongoose.Types.ObjectId.isValid(value))
        .withMessage('A valid id is required'),
];

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
                req.file.size > variables.MAX_IMAGE_SIZE
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
                req.file.size > variables.MAX_IMAGE_SIZE
            ) {
                return false;
            }
            return true;
        })
        .withMessage('coverImage must be an image less than 10MB'),
    body('categories')
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

const DELETE_EVENT_VALIDATION_RULES = [
    param('id')
        .exists()
        .isString()
        .custom((value) => mongoose.Types.ObjectId.isValid(value))
        .withMessage('A valid id is required'),
];

const PUT_EVENT_VALIDATION_RULES = [
    param('id')
        .exists()
        .isString()
        .custom((value) => mongoose.Types.ObjectId.isValid(value))
        .withMessage('A valid id is required'),
    body('title').optional().isString().withMessage('title must be a string'),
    body('content')
        .optional()
        .isString()
        .withMessage('content must be a string'),
    body('coverImage')
        .custom((value, { req }) => {
            // image is optional
            if (!req.file) return true;
            if (
                req.file.mimetype.split('/')[0] !== 'image' ||
                req.file.size > variables.MAX_IMAGE_SIZE
            ) {
                return false;
            }
            return true;
        })
        .withMessage('coverImage must be an image less than 10MB'),
    body('date').optional().isDate().withMessage('date is required'),
    body('categories')
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
    body('confirmedVolunteers')
        .optional()
        .isArray({ min: 1 })
        .withMessage('confirmedVolunteers must be an unempty array')
        .bail()
        .custom((array) =>
            array.every(
                (id) => isString(id) && mongoose.Types.ObjectId.isValid(id)
            )
        )
        .withMessage('confirmedVolunteers must be an array of valid ids'),
    body('invitedVolunteers')
        .optional()
        .isArray({ min: 1 })
        .custom((array) =>
            array.every(
                (id) => isString(id) && mongoose.Types.ObjectId.isValid(id)
            )
        )
        .withMessage('invitedVolunteers must be an array of valid ids'),
    body('address')
        .optional()
        .isObject()
        .custom((address) => {
            if (!address) return true;
            return (
                isString(address.addressLine) &&
                isString(address.city) &&
                isString(address.country)
            );
        })
        .withMessage(
            'address must be an object that contains street, city and country properties which all must be strings'
        ),
    body('location')
        .optional()
        .isObject()
        .custom((location) => {
            if (!location) return true;
            return isString(location.lat) && isString(location.log);
        })
        .withMessage(
            'location must be an object that contains lat and log properties which both must be floats'
        ),
];

const VOLUNTEERS_EVENT_VALIDATION_RULES = [
    param('id')
        .exists()
        .isString()
        .custom((value) => mongoose.Types.ObjectId.isValid(value))
        .withMessage('A valid id is required'),
];

const DONATE_VALIDATION_RULES = [
    param('id')
        .exists()
        .isString()
        .custom((value) => mongoose.Types.ObjectId.isValid(value))
        .withMessage('A valid id is required'),
    body('amount').isNumeric().withMessage('amount must be a number'),
];

const CREATE_EVENT_VALIDATION_RULES = [
    body('title')
        .exists()
        .isString()
        .isLength()
        .withMessage('title is required'),
    body('content')
        .exists()
        .isString()
        .isLength()
        .withMessage(' content is required'),
    body('coverImage')
        .custom((value, { req }) => {
            if (!req.file) return false;
            if (
                req.file.mimetype.split('/')[0] !== 'image' ||
                req.file.size > MAX_IMAGE_SIZE
            ) {
                return false;
            }
            return true;
        })
        .withMessage('coverImage must be an image less than 10MB'),
    body('date').exists().isDate().withMessage('date is required'),
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
    body('address')
        .exists()
        .isObject()
        .custom((address) => {
            if (!address) return true;
            return (
                isString(address.addressLine) &&
                isString(address.city) &&
                isString(address.country)
            );
        })
        .withMessage(
            'address must be an object that contains street, city and country properties which all must be strings'
        ),
    body('location')
        .exists()
        .isObject()
        .custom((location) => {
            if (!location) return true;
            return location.lat && location.log;
        })
        .withMessage(
            'location must be an object that contains lat and log properties which both must be floats'
        ),
];

const CREATE_FUND_VALIDATION_RULES = [
    body('title')
        .exists()
        .isString()
        .isLength()
        .withMessage('title is required'),
    body('content')
        .exists()
        .isString()
        .isLength()
        .withMessage('content is required'),
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
    body('address')
        .exist()
        .isObject()
        .custom((address) => {
            return (
                isString(address.addressLine) &&
                isString(address.city) &&
                isString(address.country)
            );
        })
        .withMessage(
            'address must be an object that contains street, city, and country properties which all must be strings'
        ),
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
    VERIFY_VALIDATION_FUNDSBYID,
    USER_SIGNUP_VALIDATION_RULES,
    ORGANIZATION_SIGNUP_VALIDATION_RULES,
    VERIFY_VALIDATION_RULES,
    SIGNIN_VALIDATION_RULES,
    GET_EVENTS_VALIDATION_RULES,
    GET_EVENT_ID_VALIDATION_RULES,
    DELETE_EVENT_VALIDATION_RULES,
    PUT_EVENT_VALIDATION_RULES,
    VOLUNTEERS_EVENT_VALIDATION_RULES,
    DONATE_VALIDATION_RULES,
    CREATE_EVENT_VALIDATION_RULES,
    CREATE_FUND_VALIDATION_RULES,
    handleValidation,
};
