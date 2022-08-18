const { User } = require('../models/user');

async function getUserProfile(req, res) {
    const requiredEventField = [
        'id',
        'title',
        'content',
        'coverImage',
        'date',
        'categories',
        'confirmedVolunteers',
        'invitedVolunteers',
        'address',
        'location',
        'createdAt',
    ];
    const requiredFundField = ['publisherId', 'title', 'categories'];
    const requiredUserFields = [
        'id',
        'firstName',
        'lastName',
        'email',
        'profileImage',
    ];
    try {
        const getUser = await User.findOne({ _id: req.user.id })
            .populate({
                path: 'createdEvents',
                populate: [
                    {
                        path: 'confirmedVolunteers',
                        select: requiredUserFields.join(' '),
                    },
                    {
                        path: 'invitedVolunteers',
                        select: requiredUserFields.join(' '),
                    },
                ],
            })
            .populate('followers', requiredUserFields.join(' '))
            .populate('createdFunds')
            .populate({
                path: 'followedEvents',
                populate: [
                    {
                        path: 'confirmedVolunteers',
                        // select: requiredUserFields.join(' '),
                    },
                    {
                        path: 'invitedVolunteers',
                        select: requiredUserFields.join(' '),
                    },
                ],
            })
            .populate('followedFunds')
            .populate('followedUsers', requiredUserFields.join(' '))
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
