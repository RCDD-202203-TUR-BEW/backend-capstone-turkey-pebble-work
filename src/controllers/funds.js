/* eslint-disable consistent-return */
const mongoose = require('mongoose');
const Funds = require('../models/fund');

module.exports = {
    getFunds: async (req, res) => {
        try {
            const { category, publisherId, lastDate, currentDate } = req.query;
            const filter = {};
            if (category) {
                filter.category = { $in: category };
            }
            if (publisherId) {
                filter.publisherId = mongoose.Types.ObjectId(publisherId);

                // mongoose.Types.ObjectId()
            }
            if (lastDate && currentDate) {
                filter.createdAt = { $gte: currentDate, $lte: lastDate };
            }
            const filteredItem = await Funds.find(filter);
            if (filteredItem.length === 0) {
                return res.status(500).json({
                    success: false,
                });
            }
            res.status(200).json(filteredItem);
        } catch (err) {
            return res.status(err);
        }
    },
};
