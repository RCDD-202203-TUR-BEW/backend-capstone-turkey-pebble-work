/* eslint-disable consistent-return */
const mongoose = require('mongoose');
const Funds = require('../models/fund');

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
        res.status(200).json(filteredItem);
    } catch (err) {
        return res.sendStatus(500);
    }
}

module.exports = {
    getFunds,
};
