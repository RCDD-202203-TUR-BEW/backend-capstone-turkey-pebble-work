/* eslint-disable no-underscore-dangle */
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const { User, Organization, BaseUser, Token } = require('../models/user');
const { sendHtmlEmail } = require('../utility/mail');
const storage = require('../db/storage');
const { getFileExtension } = require('../utility/utils');
const { getPrivateUser } = require('./users');
const { getPrivateOrga } = require('./organizations');

const {
    HASH_ROUNDS,
    FOURTEEN_DAYS_MILLISECONDS,
    FOURTEEN_DAYS_STRING,
    PROFILE_IMAGE_DIR,
    COVER_IMAGE_DIR,
    EMAIL_VERIFY_SUBJECT,
} = require('../utility/variables');

async function sendVerificationEmail(user, token) {
    const verificationLink = `${process.env.BASE_URL}/api/auth/verify/${user.id}/${token.token}`;
    const html = `<dev>Hello ${user.fullName}</dev> <br> <br> <dev>Please click on the following link to verify your email:</dev> <br> <br> <a href="${verificationLink}">Link</a> <br> <br> <dev>If you did not request this, please ignore this email.</dev> <br> <br> <dev>Thanks,</dev> <br> <dev>PebbleWork Team</dev>`;
    const subject = EMAIL_VERIFY_SUBJECT;
    return sendHtmlEmail(user.email, subject, html);
}

async function getUser(req, payload) {
    let userToReturn;
    if (req.path === '/user/signup') {
        req.user = payload;
        userToReturn = await getPrivateUser(req);
    } else {
        req.user = payload;
        userToReturn = await getPrivateOrga(req);
    }
    return userToReturn;
}

async function signUp(req, res) {
    try {
        const alreadyExistingUser = await BaseUser.findOne({
            email: req.body.email,
        });

        if (alreadyExistingUser) {
            return res.status(400).json({ message: 'Email already used' });
        }

        const hashedPassword = await bcrypt.hash(
            req.body.password,
            HASH_ROUNDS
        );

        let newBaseUser = null;

        if (req.path === '/user/signup') {
            newBaseUser = await new User({
                email: req.body.email,
                hashedPassword,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                dateOfBirth: req.body.dateOfBirth,
                preferredCities: req.body.preferredCities,
                interests: req.body.interests,
                gender: req.body.gender,
            }).save();

            // image is optional
            if (req.file) {
                const imgUrl = await storage.uploadImage(
                    req.file,
                    `${PROFILE_IMAGE_DIR}/${newBaseUser.id}.${getFileExtension(
                        req.file.originalname
                    )}`
                );
                newBaseUser.profileImage = imgUrl;
            }
        } else {
            newBaseUser = await new Organization({
                email: req.body.email,
                hashedPassword,
                name: req.body.name,
                description: req.body.description,
                city: req.body.city,
                categories: req.body.categories,
            }).save();
            if (req.file) {
                const imgUrl = await storage.uploadImage(
                    req.file,
                    `${COVER_IMAGE_DIR}/${newBaseUser.id}.${getFileExtension(
                        req.file.originalname
                    )}`
                );
                newBaseUser.coverImage = imgUrl;
            }
        }

        await newBaseUser.save();

        const payload = {
            id: newBaseUser.id,
            email: newBaseUser.email,
            // if organization, fullName is the same as name
            fullName: newBaseUser.fullName,
        };

        const token = jwt.sign(payload, process.env.SECRET_KEY, {
            expiresIn: FOURTEEN_DAYS_STRING,
        });

        res.cookie('auth_token', token, {
            httpOnly: true,
            signed: true,
            expires: new Date(Date.now() + FOURTEEN_DAYS_MILLISECONDS),
            secure: true,
            sameSite: 'none',
        });

        const verificationToken = await new Token({
            userId: newBaseUser.id,
            token: crypto.randomBytes(32).toString('hex'),
        }).save();

        await sendVerificationEmail(newBaseUser, verificationToken);

        const userToReturn = await getUser(req, payload);

        return res.status(200).json({
            message:
                'User successfully signed up and a verification email sent',
            user: userToReturn,
        });
    } catch (error) {
        return res.sendStatus(500);
    }
}

async function verifyBaseUserEmail(req, res) {
    try {
        const baseUser = await BaseUser.findOne({
            _id: req.params.id,
        });

        if (!baseUser) {
            return res.status(400).json({ message: 'Invalid link' });
        }

        if (baseUser.isVerified) {
            return res.status(400).json({ message: 'User already verified' });
        }

        const token = await Token.findOne({
            userId: baseUser.id,
            token: req.params.token,
        });

        if (!token) {
            return res.status(400).json({ message: 'Invalid link' });
        }

        await BaseUser.updateOne({ _id: baseUser.id }, { isVerified: true });
        await Token.findByIdAndDelete(token.id);

        return res.status(200).json({ message: 'User verified' });
    } catch (error) {
        console.log(error);
        return res.sendStatus(500).json({ error: 'Internal server error' });
    }
}

async function signIn(req, res) {
    try {
        const baseUser = await BaseUser.findOne({ email: req.body.email });
        if (!baseUser) {
            return res
                .status(400)
                .json({ message: 'Invalid email or password' });
        }
        const isPasswordValid = await bcrypt.compare(
            req.body.password,
            baseUser.hashedPassword
        );
        if (!isPasswordValid) {
            return res
                .status(400)
                .json({ message: 'Invalid email or password' });
        }
        // create token
        const payload = {
            id: baseUser.id,
            email: baseUser.email,
            fullName: baseUser.fullName,
        };
        const token = jwt.sign(payload, process.env.SECRET_KEY, {
            expiresIn: FOURTEEN_DAYS_STRING,
        });
        // console.log(token);

        // set cookie
        res.cookie('auth_token', token, {
            httpOnly: true,
            signed: true,
            expires: new Date(Date.now() + FOURTEEN_DAYS_MILLISECONDS),
            secure: true,
            sameSite: 'none',
        });

        const result = {};
        if (!baseUser.isVerified) {
            result.warning = 'User not verified';
        }
        result.message = 'User signed in';
        result.user = await getUser(req, payload);
        return res.status(200).json(result);
    } catch (error) {
        return res.sendStatus(500);
    }
}

async function signOut(req, res) {
    try {
        res.clearCookie('auth_token');
        return res.status(200).json({ message: 'User signed out' });
    } catch (error) {
        return res.sendStatus(500);
    }
}

async function saveGoogleUser(req, res) {
    const googleId = `google-${req.user._json.sub}`;

    let user = await BaseUser.findOne({ providerId: googleId });

    if (!user) {
        user = await BaseUser.create({
            email: req.user._json.email,
            fullName: req.user._json.name,
            firstName: req.user._json.given_name,
            lastName: req.user._json.family_name,
            provider: 'google',
            providerId: googleId,
            isVerified: true,
        });
    }

    const payload = {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
    };
    const token = jwt.sign(payload, process.env.SECRET_KEY, {
        expiresIn: FOURTEEN_DAYS_STRING,
    });

    res.cookie('auth_token', token, {
        httpOnly: true,
        signed: true,
        expires: new Date(Date.now() + FOURTEEN_DAYS_MILLISECONDS),
        secure: true,
        sameSite: 'none',
    });

    const userToReturn = await getUser(req, payload);

    res.status(200).json({
        message: 'User successfully signed in',
        user: userToReturn,
    });
}

module.exports = {
    signUp,
    verifyBaseUserEmail,
    signIn,
    signOut,
    saveGoogleUser,
};
