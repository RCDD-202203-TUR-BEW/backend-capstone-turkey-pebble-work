const _ = require('lodash');
const bcrypt = require('bcrypt');
const { User } = require('../models/user');
const storage = require('../db/storage');
const variables = require('../utility/variables');
const utils = require('../utility/utils');
const { HASH_ROUNDS } = require('../utility/variables');

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

module.exports = {
    updateUserProfile,
};
