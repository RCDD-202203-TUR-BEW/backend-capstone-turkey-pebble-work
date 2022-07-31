const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const { User, Organization, BaseUser, Token } = require('../models/user');
const { sendEmail } = require('../utility/mail');
const storage = require('../db/storage');
const { getFileExtension } = require('../utility/utils');

const HASH_ROUNDS = 10;
const FOURTEEN_DAYS_MILLISECONDS = 1000 * 60 * 60 * 24 * 14; // 14 days
const FOURTEEN_DAYS_STRING = '14d'; // 14 days
const PROFILE_IMAGE_DIR = 'profileImages';
const COVER_IMAGE_DIR = 'coverImages';

async function sendVerificationEmail(user, token) {
    const verificationLink = `${process.env.BASE_URL}/api/auth/verify/${user.id}/${token.token}`;
    const text = `Hello ${user.fullName},\n\nPlease verify your account by clicking the link below:\n${verificationLink}`;
    const subject = 'Verify your account';
    return sendEmail(user.email, subject, text);
}

async function signUp(req, res) {
    try {
        // check if baseUser already exists
        const oldUser = await BaseUser.findOne({ email: req.body.email });
        if (oldUser) {
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

        // create token
        const payload = {
            id: newBaseUser.id,
            email: newBaseUser.email,
            // if organization, fullName is the same as name
            fullName: newBaseUser.fullName,
        };
        const token = jwt.sign(payload, process.env.SECRET_KEY, {
            expiresIn: FOURTEEN_DAYS_STRING,
        });

        // set cookie
        res.cookie('auth_token', token, {
            httpOnly: true, // only accessible by server
            signed: true,
            expires: new Date(Date.now() + FOURTEEN_DAYS_MILLISECONDS),
            secure: process.env.NODE_ENV === 'production',
        });

        // send verification email
        const verificationToken = await new Token({
            userId: newBaseUser.id,
            token: crypto.randomBytes(32).toString('hex'),
        }).save();

        await sendVerificationEmail(newBaseUser, verificationToken);

        return res.status(200).json({
            message:
                'User successfully signed up and a verification email sent',
        });
    } catch (error) {
        console.log(error);
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
        await BaseUser.updateOne({ _id: baseUser.id, isVerified: true });
        await Token.findByIdAndDelete(token.id);

        return res.status(200).json({ message: 'User verified' });
    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
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

        // set cookie
        res.cookie('auth_token', token, {
            httpOnly: true,
            signed: true,
            expires: new Date(Date.now() + FOURTEEN_DAYS_MILLISECONDS),
            secure: process.env.NODE_ENV === 'production',
        });

        const result = {};
        if (!baseUser.isVerified) {
            result.warning = 'User not verified';
        }
        result.message = 'User signed in';
        return res.status(200).json(result);
    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
}

async function signOut(req, res) {
    try {
        res.clearCookie('auth_token');
        return res.status(200).json({ message: 'User signed out' });
    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
}

module.exports = {
    signUp,
    verifyBaseUserEmail,
    signIn,
    signOut,
};
