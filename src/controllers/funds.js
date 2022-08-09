const mongoose = require('mongoose');
const Funds = require('../models/fund');
const Fund = require('../models/fund');

async function getFunds(req, res) {
    try {
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
        const filteredItem = await Funds.find(filter);
        return res.status(200).json(filteredItem);
    } catch (err) {
        return res.sendStatus(500);
    }
}

async function donate(req, res) {
    try {
        const { id } = req.params;
        const { amount } = req.body;
        const existingFund = await Fund.findById(id);

        if (!existingFund) {
            return res.status(404).json({ message: 'Fund not found' });
        }

        const donationObj = {
            amount,
        };

        if (req.user) {
            donationObj.userId = mongoose.Types.ObjectId(id);
        }

        await Fund.findByIdAndUpdate(id, {
            $push: {
                donations: donationObj,
            },
        });

        return res.status(201).json({ message: 'Donation successful' });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = {
    getFunds,
    donate,
};
