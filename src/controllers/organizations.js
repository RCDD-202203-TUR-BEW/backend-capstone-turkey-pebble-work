const mongoose = require('mongoose');
const { User, Organization } = require('../models/user');

const addOrganizationSubscription = async (req, res) => {
    try {
        const followOrganizationId = mongoose.Types.ObjectId(req.params.id);

        const organization = await Organization.findById(followOrganizationId);

        if (!organization) {
            res.status(404).json({ message: 'Organization not found' });
        }

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

async function getOneOrganization(req) {
    const { id: orgaId } = req.params;
    const requiredUserFields = ['id', 'firstName', 'lastName', 'profileImage'];

    const orgaExecludedFields = {
        email: 0,
        hashedPassword: 0,
        provider: 0,
        providerId: 0,
        isVerified: 0,
    };

    const organization = await Organization.findById(
        orgaId,
        orgaExecludedFields
    )
        .populate('followers', requiredUserFields.join(' '))
        .populate('createdFunds')
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
        .populate('rates.userId', requiredUserFields.join(' '));

    return organization;
}

async function rate(req, res) {
    try {
        const { id: orgaId } = req.params;
        const { id: userId } = req.user;
        const { rating: newRating } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ error: 'Only users can rate' });
        }

        let existingOrganization = await Organization.findById(orgaId);

        if (!existingOrganization) {
            return res.status(404).json({ error: 'Organization not found' });
        }

        // check if the user has already rated the organization before
        if (
            existingOrganization.rates.find(
                (rating) => rating.userId.toString() === userId
            )
        ) {
            existingOrganization = await Organization.findOneAndUpdate(
                {
                    _id: orgaId,
                    'rates.userId': mongoose.Types.ObjectId(userId),
                },
                { $set: { 'rates.$.rate': newRating } },
                { new: true }
            );
            // if the user has not rated the organization before, create a new rating
        } else {
            existingOrganization.rates.push({
                userId: mongoose.Types.ObjectId(userId),
                rate: newRating,
            });
        }

        await existingOrganization.save();
        const updatedOrganization = await getOneOrganization(req);

        return res.status(201).json(updatedOrganization);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

async function deleteRate(req, res) {
    try {
        const { id: orgaId } = req.params;
        const { id: userId } = req.user;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ error: 'Only users can rate' });
        }

        let existingOrganization = await Organization.findById(orgaId);

        if (!existingOrganization) {
            return res.status(404).json({ error: 'Organization not found' });
        }

        // check if the user has already rated the organization before
        if (
            existingOrganization.rates.find(
                (rating) => rating.userId.toString() === userId
            )
        ) {
            existingOrganization = await Organization.findOneAndUpdate(
                {
                    _id: orgaId,
                    'rates.userId': mongoose.Types.ObjectId(userId),
                },
                {
                    $pull: {
                        rates: { userId: mongoose.Types.ObjectId(userId) },
                    },
                },
                { new: true }
            );
        } else {
            return res.status(404).json({ error: 'Rating not found' });
        }

        await existingOrganization.save();
        const updatedOrganization = await getOneOrganization(req);

        return res.status(201).json(updatedOrganization);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = {
    rate,
    deleteRate,
    addOrganizationSubscription,
};
