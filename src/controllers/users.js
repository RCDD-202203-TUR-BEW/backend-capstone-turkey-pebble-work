const { User } = require('../models/user');

async function getUserPublicProfile(req, res) {
    const requiredUserFields = [
        'id',
        'firstName',
        'lastName',
        'email',
        'profileImage',
    ];
    const excludeFields = { hashedPassword: 0, provider: 0, isVerified: 0 };
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Page not found' });
        }
        const getUser = await User.findOne({ _id: req.user.id }, excludeFields)
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
                        select: requiredUserFields.join(' '),
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
            return res.status(403).json({ message: 'User Not Authorised!' });
        }
        return res.status(200).json(getUser);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
async function getUserPrivateProfile(req, res) {
    const requiredUserFields = [
        'id',
        'firstName',
        'lastName',
        'email',
        'profileImage',
    ];
    try {
        const user = await User.findOne({ _id: req.user.id })
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
                        select: requiredUserFields.join(' '),
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
        if (!user) {
            return res.status(403).json({ message: 'User Not Authorised!' });
        }
        return res.status(200).json(user);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
module.exports = {
    getUserPublicProfile,
    getUserPrivateProfile,
};
