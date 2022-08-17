const { User } = require('../models/user');

async function getUserProfile(req, res) {
    const requiredEventField = [
        'publisherId',
        'title',
        'coverImage',
        'categories',
    ];
    const requiredFundField = ['publisherId', 'title', 'categories'];
    const requiredUserField = [
        'firstName',
        'lastName',
        'email',
        'profileImage',
    ];
    try {
        const getUser = await User.findOne({ _id: req.user.id })
            .populate('createdEvents', requiredEventField.join(' '))
            .populate('followers', requiredUserField.join(' '))
            .populate('createdFunds', requiredFundField.join(' '))
            .populate('followedEvents', requiredEventField.join(' '))
            .populate('followedFunds', requiredFundField.join(' '))
            .populate('followedUsers', requiredUserField.join(' '))
            .populate('followedOrganizations');
        if (!getUser) {
            return res.status(404).json({ message: 'Page not found' });
        }
        return res.status(200).json(getUser);
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = {
    getUserProfile,
};
