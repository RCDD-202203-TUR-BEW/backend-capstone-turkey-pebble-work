/* eslint-disable no-underscore-dangle */
/* eslint-disable consistent-return */
const mongoose = require('mongoose');
const Funds = require('../models/fund');
const { BaseUser } = require('../models/user');
const { sendEmail } = require('../utility/mail');

async function getSingleFund(req, res) {
    try {
        const id = mongoose.Types.ObjectId(req.params.id);
        const requiredUserField = [
            'id',
            'firstName',
            'lastName',
            'email',
            'profileImage',
        ];

        const fund = await Funds.findById(id).populate(
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
            'email',
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
        const filteredItem = await Funds.find(filter).populate(
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
        const fund = await Funds.findById(id).populate('donations.donorId');
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
        await Funds.findByIdAndDelete(id);

        return res.status(204).json({ message: 'Fund deleted' });
    } catch (err) {
        return res.status(500).json({ error: 'Internal server error' });
    }
}
module.exports = {
    getFunds,
    getSingleFund,
    deleteFund,
};
