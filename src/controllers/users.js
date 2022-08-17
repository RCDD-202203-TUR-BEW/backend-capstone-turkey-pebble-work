const _ = require('lodash');
const bcrypt = require('bcrypt');
const { User, Organization } = require('../models/user');
const storage = require('../db/storage');
const variables = require('../utility/variables');
const utils = require('../utility/utils');
const { HASH_ROUNDS } = require('../utility/variables');

async function getUserProfile(req, res) {
    const requiredEventField = [
        'publisherId',
        'title',
        'coverImage',
        'categories',
    ];
    const requiredFundField = ['publisherId', 'title', 'categories'];
    const requiredUserField = [
        'firstName',
        'lastName',
        'email',
        'profileImage',
    ];
    try {
        const getUser = await User.findOne({ _id: req.user.id })
            .populate('createdEvents', requiredEventField.join(' '))
            .populate('followers', requiredUserField.join(' '))
            .populate('createdFunds', requiredFundField.join(' '))
            .populate('followedEvents', requiredEventField.join(' '))
            .populate('followedFunds', requiredFundField.join(' '))
            .populate('followedUsers', requiredUserField.join(' '))
            .populate('followedOrganizations');
        if (!getUser) {
            return res.status(404).json({ message: 'Page not found' });
        }
        return res.status(200).json(getUser);
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
}

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

async function updateUserProfile(req, res) {
    const user = await User.findOne({ _id: req.user.id });
    if (!user) {
        return res.status(403).json({ message: 'User Not Authorised!' });
    }

    try {
        const newUser = _.pick(req.body, [
            'email',
            'firstName',
            'lastName',
            'password',
            'dateOfBirth',
            'preferredCities',
            'interests',
            'gender',
        ]);

        const profileImage = req.file;
        const updateUser = await User.findByIdAndUpdate(req.user.id, newUser, {
            new: true,
        });
        if (newUser.password) {
            const hashedPassword = await bcrypt.hash(
                newUser.password,
                HASH_ROUNDS
            );
            updateUser.hashedPassword = hashedPassword;
        }
        if (profileImage) {
            const imgUrl = await storage.uploadImage(
                profileImage,
                `${variables.PROFILE_IMAGE_DIR}/${
                    updateUser.id
                }.${utils.getFileExtension(profileImage.originalname)}`
            );
            updateUser.profileImage = imgUrl;
        }
        await updateUser.save();
        return res.status(200).json(updateUser);
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
}

async function updateOrgProfile(req, res) {
    const orga = await Organization.findOne({ _id: req.user.id });
    if (!orga) {
        return res.status(403).json({ message: 'User Not Authorised!' });
    }
    try {
        const newOrga = _.pick(req.body, [
            'email',
            'password',
            'name',
            'description',
            'categories',
            'city',
            'websiteUrl',
        ]);

        const coverImage = req.file;
        const updateOrga = await Organization.findByIdAndUpdate(
            req.user.id,
            newOrga,
            {
                new: true,
            }
        );
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
        return res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = {
    getUserProfile,
    getOrgProfile,
    updateUserProfile,
    updateOrgProfile,
};
