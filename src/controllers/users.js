const { BaseUser, User, Organization } = require('../models/user');

// POST /api/user/:id/subscription
const addUserSubscription = async (req, res) => {
    const { id: followUserId } = req.params;

    const user = await BaseUser.findById(req.user.id);
    user.followedUsers.push(followUserId);
    await user.save();

    const followedUser = await BaseUser.findById(followUserId);
    followedUser.followers.push(req.user.id);
    await followedUser.save();
};

// POST /api/organization/:id/subscription
const addOrganizationSubscription = async (req, res) => {
    const { id: followOrganizationId } = req.params;

    const user = await BaseUser.findById(req.user.id);
    user.followedOrganizations.push(followOrganizationId);
    await user.save();

    const followedOrganization = await BaseUser.findById(followOrganizationId);
    followedOrganization.followers.push(req.user.id);
    await followedOrganization.save();
};

module.exports = {
    addUserSubscription,
    addOrganizationSubscription,
};
