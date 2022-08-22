const _ = require('lodash');
const bcrypt = require('bcrypt');
const { Organization, BaseUser } = require('../models/user');
const storage = require('../db/storage');
const variables = require('../utility/variables');
const utils = require('../utility/utils');
const { HASH_ROUNDS } = require('../utility/variables');

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

        const usedEmail = await BaseUser.findOne({ email: newOrga.email });
        if (usedEmail) {
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

module.exports = {
    updateOrgProfile,
};
