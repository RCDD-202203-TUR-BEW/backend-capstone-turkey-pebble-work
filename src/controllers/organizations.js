const { Organization } = require('../models/user');

async function getOrgProfile(req, res) {
    const requiredEventFields = [
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
    const requiredFundFields = [
        'id',
        'title',
        'content',
        'categories',
        'targetFund',
        'gatheredFund',
        'address',
        'createdAt',
        'remainingFund',
    ];
    const requiredUserFields = [
        'id',
        'firstName',
        'lastName',
        'email',
        'profileImage',
    ];

    const notIncludeField = { hashedPassword: 0, provider: 0 };
    try {
        const org = await Organization.findById(req.params.id);
        if (!org) {
            return res.status(404).json({ message: 'Page not found' });
        }
        const getOrg = await Organization.findOne(
            { _id: req.params.id },
            notIncludeField
        )
            .populate({
                path: 'createdEvents',
                select: requiredEventFields.join(' '),
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
            .populate('createdFunds', requiredFundFields.join(' '))
            .populate('rates.userId', requiredUserFields.join(' '));

        return res.status(200).json(getOrg);
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = {
    getOrgProfile,
};
