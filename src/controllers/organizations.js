const { Organization } = require('../models/user');

async function getOrgPublicProfile(req, res) {
    const requiredUserFields = [
        'id',
        'firstName',
        'lastName',
        'email',
        'profileImage',
    ];

    const excludeFields = { hashedPassword: 0, provider: 0, isVerified: 0 };
    try {
        const orga = await Organization.findById(req.params.id);
        if (!orga) {
            return res.status(404).json({ message: 'Page not found' });
        }
        const getOrg = await Organization.findOne(
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

        return res.status(200).json(getOrg);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

async function getOrgPrivateProfile(req, res) {
    const requiredUserFields = [
        'id',
        'firstName',
        'lastName',
        'email',
        'profileImage',
    ];

    try {
        const orga = await Organization.findOne({ _id: req.params.id })
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
        if (!orga) {
            return res.status(403).json({ message: 'User Not Authorised!' });
        }
        return res.status(200).json(orga);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = {
    getOrgPublicProfile,
    getOrgPrivateProfile,
};
