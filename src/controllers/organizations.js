const { User } = require('../models/user');

const addOrganizationSubscription = async (req, res) => {
    try {
        const { id: followOrganizationId } = req.params;

        await User.findByIdAndUpdate(req.user.id, {
            $push: {
                followedOrganizations: followOrganizationId,
            },
        });

        await User.findByIdAndUpdate(followOrganizationId, {
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
    addOrganizationSubscription,
};
