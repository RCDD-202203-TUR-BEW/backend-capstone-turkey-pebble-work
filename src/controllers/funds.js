const mongoose = require('mongoose');
const Funds = require('../models/fund');
const { sendEmail } = require('../utility/mail');

async function getOneFund(req, res) {
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
        return null;
        // const fund = await Funds.findById(id);
        // console.log(fund + "<<<<<<<<<<<====");
        // await fund.donations.forEach(async (doner) => {
        //     doner._id.followedFunds.pull(id);
        //     await doner.save();
        //     await sendEmail(
        //         doner.email,
        //         'Fund deleted', // subject
        //         `Unfortunately, the dund ${fund.title} has been deleted. you donation amount ${fund.donations.amount} will be sent back within 24 hours.`
        //     );
        // });
    } catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
}
module.exports = {
    getFunds,
    getOneFund,
    deleteFund,
};
