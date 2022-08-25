const _ = require('lodash');
const bcrypt = require('bcrypt');
const { default: mongoose } = require('mongoose');
const { Organization, User, BaseUser } = require('../models/user');
const storage = require('../db/storage');
const variables = require('../utility/variables');
const utils = require('../utility/utils');
const { HASH_ROUNDS } = require('../utility/variables');

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

async function updateOrgProfile(req, res) {
    const orga = await Organization.findOne({ _id: req.user.id });
    if (!orga) {
        return res.status(403).json({ message: 'User Not Authorised!' });
    }

    try {
        const coverImage = req.file;
        const newOrga = _.pick(req.body, [
            'email',
            'password',
            'name',
            'description',
            'categories',
            'city',
            'websiteUrl',
        ]);

        const existingUser = await BaseUser.findOne({ email: newOrga.email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already used' });
        }

        const updateOrga = await Organization.findByIdAndUpdate(
            req.user.id,
            newOrga,
            {
                new: true,
            }
        ).select('-hashedPassword -provider -providerId -isVerified');

        if (newOrga.password) {
            const hashedPassword = await bcrypt.hash(
                newOrga.password,
                HASH_ROUNDS
            );
            updateOrga.hashedPassword = hashedPassword;
        }
        if (coverImage) {
            const imgUrl = await storage.uploadImage(
                coverImage,
                `${variables.COVER_IMAGE_DIR}/${
                    updateOrga.id
                }.${utils.getFileExtension(coverImage.originalname)}`
            );
            updateOrga.coverImage = imgUrl;
        }
        await updateOrga.save();
        return res.status(200).json(updateOrga);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

async function unFollowOrga(req, res) {
    try {
        const { id: orgaId } = req.params;
        const { id: userId } = req.user;
        const user = await User.findById(userId);
        if (user) {
            if (Organization.findById(orgaId)) {
                user.followedOrganizations.pull(orgaId);
                user.save();
            } else {
                return res
                    .status(404)
                    .json({ error: 'Organization not found' });
            }
        } else {
            return res.status(404).json({ error: 'User not found' });
        }
        return res.status(200).json({ message: 'Unfollowed Successfully!' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
module.exports = {
    rate,
    deleteRate,
    updateOrgProfile,
    unFollowOrga,
};
