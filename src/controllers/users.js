const _ = require('lodash');
const bcrypt = require('bcrypt');
const { User, BaseUser } = require('../models/user');
const storage = require('../db/storage');
const variables = require('../utility/variables');
const utils = require('../utility/utils');
const { HASH_ROUNDS } = require('../utility/variables');

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

async function getPrivateUser(req) {
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

    const userProfile = await User.findOne({ _id: req.user.id }, excludeFields)
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

    return userProfile;
}

async function getUserPrivateProfile(req, res) {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(403).json({ message: 'User Not Authorised!' });
        }
        const userProfile = await getPrivateUser(req);
        return res.status(200).json(userProfile);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

async function updateUserProfile(req, res) {
    const user = await User.findById(req.user.id);
    if (!user) {
        return res.status(403).json({ message: 'User Not Authorised!' });
    }

    try {
        const profileImage = req.file;
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
        const existingUser = await BaseUser.findOne({ email: newUser.email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already used' });
        }

        const updateUser = await User.findByIdAndUpdate(req.user.id, newUser, {
            new: true,
        }).select('-hashedPassword -provider -providerId -isVerified');

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
        console.log(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = {
    getUserPublicProfile,
    getUserPrivateProfile,
    updateUserProfile,
    getPrivateUser,
};
