const { Organization } = require('../models/user');

async function getOrgPublicProfile(req, res) {
    const requiredUserFields = ['id', 'firstName', 'lastName', 'profileImage'];

    const excludeFields = {
        hashedPassword: 0,
        provider: 0,
        providerId: 0,
        isVerified: 0,
    };
    try {
        const orga = await Organization.findById(req.params.id);
        if (!orga) {
            return res.status(404).json({ message: 'Page not found' });
        }
        const orgaProfile = await Organization.findOne(
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
            .populate('rates.userId', requiredUserFields.join(' '));

        return res.status(200).json(orgaProfile);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

async function getOrgPrivateProfile(req, res) {
    const requiredUserFields = ['id', 'firstName', 'lastName', 'profileImage'];
    const excludeFields = {
        email: 0,
        hashedPassword: 0,
        provider: 0,
        providerId: 0,
        isVerified: 0,
    };
    try {
        const orga = await Organization.findById(req.user.id);
        if (!orga) {
            return res.status(403).json({ message: 'User Not Authorised!' });
        }
        const orgaProfile = await Organization.findOne(
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
            .populate('rates.userId', requiredUserFields.join(' '));

        return res.status(200).json(orgaProfile);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = {
    getOrgPublicProfile,
    getOrgPrivateProfile,
};
