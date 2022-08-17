const { Organization } = require('../models/user');

async function getOrgProfile(req, res) {
    const requiredEventField = [
        'publisherId',
        'title',
        'coverImage',
        'categories',
    ];
    const requiredFundField = ['publisherId', 'title', 'categories'];
    const requiredUserField = ['firstName', 'lastName', 'profileImage'];
    try {
        const org = await Organization.findById(req.params.id);
        if (!org) {
            return res.status(404).json({ message: 'Page not found' });
        }
        const getOrg = await Organization.findOne({ _id: req.params.id })
            .populate('createdEvents', requiredEventField.join(' '))
            .populate('followers', requiredUserField.join(' '))
            .populate('createdFunds', requiredFundField.join(' '))
            .populate('rates', requiredUserField.join(' '));

        return res.status(200).json(getOrg);
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = {
    getOrgProfile,
};
