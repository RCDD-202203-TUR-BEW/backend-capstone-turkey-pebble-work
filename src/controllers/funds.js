const { default: mongoose } = require('mongoose');
const Funds = require('../models/fund');

module.exports = {
    getFunds: async (req, res) => {
        try {
            const { category, baseUserId, lastDate, currentDate } = req.query;
            const filter = {};
            if (category) {
                filter.category = { $in: category };
            }
            if (baseUserId) {
                filter.publisherId = mongoose.Types.ObjectId(baseUserId);
            }
            if (lastDate && currentDate) {
                filter.createdAt = { $gte: currentDate, $lte: lastDate };
            }

            const filteredItem = await Funds.find(filter);
            if (!filteredItem) {
                return res.status(400).json({
                    error: 'enter a valid query!',
                });
            }
            res.status(200);
            res.json(filteredItem);
        } catch (err) {
            res.json(err.msg);
        }
        return null;
    },
};
