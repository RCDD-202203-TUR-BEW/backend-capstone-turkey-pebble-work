const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
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

module.exports = {
    getFunds,
    donate,
};
