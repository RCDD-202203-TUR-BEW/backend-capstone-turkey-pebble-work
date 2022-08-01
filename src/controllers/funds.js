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
            // if (publisherId && category) {
            //     filteredItem = await Funds.find({
            //         $and: [
            //             { publisherId: req.query.publisherId },
            //             { category: { $in: category } },
            //         ],
            //     });
            //     return res.status(200).json(filteredItem);
            // }

            const filteredItem = await Funds.find(filter).populate(
                'publisherId'
            );
            if (!filteredItem) {
                return res.status(500).json({
                    success: false,
                });
            }
            res.status(200).json(filteredItem);
        } catch (err) {
            return res.status(400);
        }
    },
};
