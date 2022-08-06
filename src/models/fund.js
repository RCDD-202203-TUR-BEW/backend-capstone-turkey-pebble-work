const mongoose = require('mongoose');
const variables = require('../utility/variables');

const fundSchema = mongoose.Schema(
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
        category: {
            type: String,
            enum: variables.CATEGORIES,
            required: true,
        },
        targetFund: {
            type: Number,
            required: true,
        },
        donations: [
            {
                donorId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'user',
                },
                amount: {
                    type: Number,
                    required: true,
                },
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
    },
    { toJSON: { virtuals: true } },
    { toObject: { virtuals: true } }
);

fundSchema.virtual('gatheredFund').get(function () {
    let sum;
    this.donations.forEach((donation) => {
        sum += donation.amount;
    });
    return sum;
});

fundSchema.virtual('remainingFund').get(function () {
    return this.targetFund - this.gatheredFund;
});

module.exports = mongoose.model('Fund', fundSchema);
