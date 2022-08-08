const mongoose = require('mongoose');
const Fund = require('../models/fund');

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
    donate,
};
