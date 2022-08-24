const _ = require('lodash');
const bcrypt = require('bcrypt');
const { User, BaseUser } = require('../models/user');
const storage = require('../db/storage');
const variables = require('../utility/variables');
const utils = require('../utility/utils');
const { HASH_ROUNDS } = require('../utility/variables');

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

async function unFolowUser(req, res) {
    try {
        const { id: userToUnfollowId } = req.params;
        const { id: userId } = req.user;
        const user = await User.findById(userId);
        if (user) {
            if (User.findById(userToUnfollowId)) {
                user.followedUsers.pull(userToUnfollowId);
                user.save();
            } else {
                return res.status(404).json({ error: 'User not found' });
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
    updateUserProfile,
    unFolowUser,
};
