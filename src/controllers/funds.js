/* eslint-disable consistent-return */
const { mongoose } = require('mongoose');
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
                filter.publisherId = publisherId;
                // mongoose.Types.ObjectId()
            }
            if (lastDate && currentDate) {
                filter.createdAt = { $gte: currentDate, $lte: lastDate };
            }

            const filteredItem = await Funds.find(filter);
            if (!filteredItem) {
                return res.status(400).res.json({
                    error: 'enter a valid query!',
                });
            }
            res.status(200);
            res.json(filteredItem);
        } catch (err) {
            res.json(err.msg);
        }
    },
};
