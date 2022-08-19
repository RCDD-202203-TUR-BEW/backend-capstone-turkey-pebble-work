const mongoose = require('mongoose');
const variables = require('../utility/variables');

const tokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BaseUser',
        required: true,
    },
    token: {
        type: String,
        required: true,
    },
});

const rate = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    rate: {
        type: Number,
        enum: [1, 2, 3, 4, 5],
        required: true,
    },
});

const baseUser = mongoose.Schema(
    {
        email: {
            type: String,
            unique: true,
            required: true,
        },
        hashedPassword: {
            type: String,
        },
        provider: {
            type: String,
            enum: ['email', 'google', 'twitter'],
            default: 'email',
            required: true,
        },
        providerId: {
            type: String,
        },
        isVerified: {
            type: Boolean,
            required: true,
            default: false,
        },
        createdEvents: {
            type: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Event',
                    required: true,
                },
            ],
            default: [],
        },
        followers: {
            type: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                    required: true,
                },
            ],
            default: [],
        },
        createdFunds: {
            type: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Fund',
                    required: true,
                },
            ],
            default: [],
        },
    },

    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

const user = mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    // fullname: virtual property
    profileImage: {
        type: String,
    },
    dateOfBirth: {
        type: String,
        required: false,
    },
    preferredCities: {
        type: [
            {
                type: String,
                enum: variables.CITIES,
                required: true,
            },
        ],
        default: [],
    },
    interests: {
        type: [
            {
                type: String,
                enum: variables.CATEGORIES,
                required: true,
            },
        ],
        default: [],
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        required: false,
    },
    // Events the user has participated in or will participate in.
    followedEvents: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Event',
                required: true,
            },
        ],
        default: [],
    },
    // funds where a user is a donor for.
    followedFunds: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Fund',
                required: true,
            },
        ],
        default: [],
    },
    followedUsers: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
        ],
        default: [],
    },
    followedOrganizations: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Organization',
                required: true,
            },
        ],
        default: [],
    },
});

user.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

const organization = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    coverImage: {
        type: String,
    },
    categories: {
        type: [
            {
                type: String,
                enum: variables.CATEGORIES,
                required: true,
            },
        ],
        default: [],
    },
    city: {
        type: String,
        required: true,
        enum: variables.CITIES,
    },
    rates: {
        type: [rate],
        default: [],
    },
    // rate : virtual property
    websiteUrl: {
        type: String,
    },
});

organization.virtual('fullName').get(function () {
    return this.name;
});

organization.virtual('rate').get(function () {
    if (!this.rates.length) return 0;
    return (
        this.rates.reduce((acc, curr) => acc + curr.rate, 0) / this.rates.length
    );
});

const BaseUser = mongoose.model('BaseUser', baseUser);
const User = BaseUser.discriminator('User', user);
const Organization = BaseUser.discriminator('Organization', organization);
const Token = mongoose.model('Token', tokenSchema);

module.exports = {
    BaseUser,
    User,
    Organization,
    Token,
};
