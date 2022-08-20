const { User } = require('../models/user');

const addUserSubscription = async (req, res) => {
    try {
        const { id: followUserId } = req.params;

        const user = await User.findByIdAndUpdate(req.user.id, {
            $push: {
                followedUsers: followUserId,
            },
        });

        if (!user) {
            res.status(404).json({ meesage: 'User not found' });
        }

        await User.findByIdAndUpdate(followUserId, {
            $push: {
                followers: req.user.id,
            },
        });

        res.status(204).json({ message: 'Succesfully subscribed' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    addUserSubscription,
};
