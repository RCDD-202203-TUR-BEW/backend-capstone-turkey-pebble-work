const mongoose = require('mongoose');
const { User } = require('../models/user');

const addUserSubscription = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            res.status(404).json({ message: 'User not found' });
        }

        await User.findByIdAndUpdate(req.user.id, {
            $addToSet: {
                followedUsers: req.params.id,
            },
        });

        await User.findByIdAndUpdate(req.params.id, {
            $push: {
                followers: req.user.id,
            },
        });

        res.status(200).json({ message: 'Successfully subscribed' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    addUserSubscription,
};
