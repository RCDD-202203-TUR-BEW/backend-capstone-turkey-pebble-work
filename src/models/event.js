const mongoose = require('mongoose');
const variables = require('../utility/variables');

const eventSchema = mongoose.Schema(
    {
        publisherId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'BaseUser',
        },
        title: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        coverImage: {
            type: String,
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        categories: {
            type: [
                {
                    type: String,
                    enum: variables.CATEGORIES,
                    required: true,
                },
            ],
            required: true,
            default: [variables.CATEGORIES[0]],
        },
        confirmedVolunteers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        invitedVolunteers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        address: {
            city: {
                type: String,
                required: true,
            },
            country: {
                type: String,
                required: true,
            },
            addressLine: {
                type: String,
                required: true,
            },
        },
        location: {
            lat: {
                type: Number,
                required: true,
            },
            log: {
                type: Number,
                required: true,
            },
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

module.exports = mongoose.model('Event', eventSchema);
