const _ = require('lodash');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Fund = require('../models/fund');
const { BaseUser, User } = require('../models/user');
const { sendEmail } = require('../utility/mail');

const createFund = async (req, res) => {
    try {
        const { title, content, targetFund, categories, address } = req.body;
        const fund = await Fund.create({
            publisherId: req.user.id,
            title,
            content,
            targetFund,
            categories,
            address: {
                city: address.city,
                country: address.country,
                addressLine: address.addressLine,
            },
        });

        await BaseUser.findByIdAndUpdate(req.user.id, {
            $push: { createdFunds: fund.id },
        });

        const requiredUserField = [
            'id',
            'firstName',
            'lastName',
            'profileImage',
        ];

        const populatedFund = await Fund.findById(fund.id).populate(
            'publisherId',
            requiredUserField.join(' ')
        );

        res.status(201).json(populatedFund);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

async function getSingleFund(req, res) {
    try {
        const id = mongoose.Types.ObjectId(req.params.id);
        const requiredUserField = [
            'id',
            'firstName',
            'lastName',
            'profileImage',
        ];

        const fund = await Fund.findById(id).populate(
            'publisherId',
            requiredUserField.join(' ')
        );
        if (!fund) {
            return res.status(404).json({
                message: 'Not found',
            });
        }
        return res.status(200).json(fund);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

async function getFunds(req, res) {
    try {
        const requiredUserField = [
            'id',
            'firstName',
            'lastName',
            'profileImage',
        ];
        const { categories, publisherId, lastDate, currentDate } = req.query;
        const filter = {};
        if (categories) {
            filter.categories = { $in: categories };
        }
        if (publisherId) {
            filter.publisherId = mongoose.Types.ObjectId(publisherId);
        }
        if (lastDate && currentDate) {
            filter.createdAt = { $gte: currentDate, $lte: lastDate };
        }
        const filteredItem = await Fund.find(filter).populate(
            'publisherId',
            requiredUserField.join(' ')
        );
        return res.status(200).json(filteredItem);
    } catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
}

async function deleteFund(req, res) {
    try {
        const { id } = req.params;
        const fund = await Fund.findById(id).populate('donations.donorId');
        await fund.donations.forEach(async (donation) => {
            if (donation.donerId) {
                donation.donorId.followedFunds.pull(id);
                await donation.donorId.save();
                await sendEmail(
                    donation.donorId.email,
                    'Fund deleted',
                    `Your money will be sent back within 24 hours.`
                );
            }
        });

        await BaseUser.findByIdAndUpdate(req.user.id, {
            $pull: {
                createdFunds: id,
            },
        });
        await Fund.findByIdAndDelete(id);

        return res.status(204).json({ message: 'Fund deleted' });
    } catch (err) {
        return res.status(500).json({ error: 'Internal server error' });
    }
}

async function donate(req, res) {
    const token = req.signedCookies.auth_token;
    try {
        let user;
        if (token) {
            user = jwt.verify(token, process.env.SECRET_KEY);
        }
        const { id } = req.params;
        const { amount } = req.body;
        const existingFund = await Fund.findById(id);

        if (!existingFund) {
            return res.status(404).json({ message: 'Fund not found' });
        }

        const donationObj = {
            amount,
        };

        if (user) {
            donationObj.donorId = mongoose.Types.ObjectId(user.id);
            await User.findByIdAndUpdate(user.id, {
                // addToSet will add the id to the array if it is not already there
                $addToSet: {
                    followedFunds: mongoose.Types.ObjectId(existingFund.id),
                },
            });
        }

        await Fund.findByIdAndUpdate(id, {
            $push: {
                donations: donationObj,
            },
        });

        return res.status(201).json({ message: 'Donation successful' });
    } catch (err) {
        console.log(err);
        if (err.name === 'UnauthorizedError') {
            return res.status(401).json({
                error: true,
                message: `Invalid Token: ${err.message}`,
            });
        }
        return res.status(500).json({ message: 'Internal server error' });
    }
}

async function updateFund(req, res) {
    const { id: fundId } = req.params;
    const publisherIdFields = ['id', 'firstName', 'lastName', 'profileImage'];
    const newFund = _.pick(req.body, [
        'title',
        'content',
        'categories',
        'targetFund',
        'address',
    ]);

    try {
        const fund = await Fund.findByIdAndUpdate(fundId, newFund, {
            new: true,
            populate: 'donations.donorId',
        });

        let updatedFundMessage = '';

        Object.entries(newFund).forEach(([key, value]) => {
            if (fund[key] !== value) {
                updatedFundMessage += `${key} changed from ${fund[key]} to ${value} \n`;
            }
        });

        await fund.donations.forEach(async (donation) => {
            if (donation.donorId) {
                await sendEmail(
                    donation.donorId.email,
                    'Fund updated',
                    `The fund ${fund.title} you had donated has various updates. \n\n${updatedFundMessage}`
                );
            }
        });

        const updatedFund = await Fund.findById(fundId).populate(
            'publisherId',
            publisherIdFields.join(' ')
        );

        return res.status(200).json(updatedFund);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = {
    getFunds,
    getSingleFund,
    deleteFund,
    donate,
    updateFund,
    createFund,
};
