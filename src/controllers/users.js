const { User } = require('../models/user');

async function getUserPublicProfile(req, res) {
    const requiredUserFields = ['id', 'firstName', 'lastName', 'profileImage'];
    const requiredOrgaFields = [
        'id',
        'name',
        'description',
        'coverImage',
        'categories',
        'city',
        'rates',
    ];

    const excludeFields = {
        email: 0,
        hashedPassword: 0,
        provider: 0,
        providerId: 0,
        isVerified: 0,
    };
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Page not found' });
        }
        const userProfile = await User.findOne(
            { _id: req.params.id },
            excludeFields
        )
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
            .populate('followedOrganizations', requiredOrgaFields.join(' '));
        return res.status(200).json(userProfile);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
async function getUserPrivateProfile(req, res) {
    const requiredUserFields = ['id', 'firstName', 'lastName', 'profileImage'];
    const requiredOrgaFields = [
        'id',
        'name',
        'description',
        'coverImage',
        'categories',
        'city',
        'rates',
        'websiteUrl',
    ];
    const excludeFields = {
        hashedPassword: 0,
        provider: 0,
        providerId: 0,
        isVerified: 0,
    };

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(403).json({ message: 'User Not Authorised!' });
        }
        const userProfile = await User.findOne(
            { _id: req.user.id },
            excludeFields
        )
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
            .populate('followedOrganizations', requiredOrgaFields.join(' '));

        return res.status(200).json(userProfile);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
module.exports = {
    getUserPublicProfile,
    getUserPrivateProfile,
};
