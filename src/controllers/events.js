/* eslint-disable consistent-return */
/* eslint-disable no-console */
const _ = require('lodash');
const mongoose = require('mongoose');
const Event = require('../models/event');
const { User, BaseUser } = require('../models/user');
const { sendEmail } = require('../utility/mail');
const storage = require('../db/storage');
const variables = require('../utility/variables');
const utils = require('../utility/utils');
const { uploadImage } = require('../db/storage');
const { getFileExtension } = require('../utility/utils');
const { EVENT_IMAGE_DIR } = require('../utility/variables');

async function getEvents(req, res) {
    const { categories, city, publisherId, fromDate, toDate, to, from } =
        req.query;
    try {
        // between filter options there is an implicit AND operator
        const filter = {};

        // gets the event if one of the categories passed is in the event
        if (categories) {
            filter.categories = { $in: categories };
        }

        if (city) {
            filter['address.city'] = city;
        }

        if (publisherId) {
            filter.publisherId = mongoose.Types.ObjectId(publisherId);
        }

        // due to the validation, we are sure that "fromDate" and "toDate" are defined togheter
        if (fromDate) {
            filter.date = { $gte: fromDate, $lte: toDate };
        }

        let events = [];

        // Which fields to populate from the user model
        const requiredUserField = [
            'id',
            'firstName',
            'lastName',
            'email',
            'profileImage',
        ];

        // due to the validation, we are sure that "from" and "to" are defined together
        if (from) {
            const limit = _.parseInt(to) - _.parseInt(from);
            const skip = _.parseInt(from);
            events = await Event.find(filter)
                .sort({ date: 1 })
                .limit(limit)
                .skip(skip)
                .populate('publisherId', requiredUserField.join(' '))
                .populate('confirmedVolunteers', requiredUserField.join(' '))
                .populate('invitedVolunteers', requiredUserField.join(' '));
        } else {
            events = await Event.find(filter)
                .sort({ date: 1 })
                .populate('publisherId', requiredUserField.join(' '))
                .populate('confirmedVolunteers', requiredUserField.join(' '))
                .populate('invitedVolunteers', requiredUserField.join(' '));
        }

        return res.status(200).json(events);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

async function deleteEvent(req, res) {
    try {
        const { id: eventId } = req.params;
        const userId = req.user.id;

        const event = await Event.findById(eventId).populate(
            'confirmedVolunteers'
        );

        // delete all references to the event in the user's collections
        await event.confirmedVolunteers.forEach(async (volunteer) => {
            volunteer.followedEvents.pull(eventId);
            await volunteer.save();
            await sendEmail(
                volunteer.email,
                'Event deleted', // subject
                `Unfortunately, the event ${event.title} that you were planning to participate in has been deleted.` // text
            );
        });

        await BaseUser.findByIdAndUpdate(userId, {
            $pull: {
                createdEvents: eventId,
            },
        });

        await Event.findByIdAndDelete(eventId);

        return res.status(204).json({ message: 'Event deleted' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

async function updateEvent(req, res) {
    const { id: eventId } = req.params;
    const newEvent = _.pick(req.body, [
        'title',
        'content',
        'date',
        'categories',
        'confirmedVolunteers',
        'invitedVolunteers',
        'address',
        'location',
    ]);
    const coverImage = req.file;

    if (newEvent.confirmedVolunteers) {
        newEvent.confirmedVolunteers = newEvent.confirmedVolunteers.map(
            (volunteer) => mongoose.Types.ObjectId(volunteer)
        );
    }
    if (newEvent.invitedVolunteers) {
        newEvent.invitedVolunteers = newEvent.invitedVolunteers.map(
            (volunteer) => mongoose.Types.ObjectId(volunteer)
        );
    }

    try {
        const event = await Event.findByIdAndUpdate(eventId, newEvent, {
            new: true,
        });

        if (coverImage) {
            const imgUrl = await storage.uploadImage(
                coverImage,
                `${
                    variables.EVENT_IMAGE_DIR
                }/${eventId}.${utils.getFileExtension(coverImage.originalname)}`
            );
            event.coverImage = imgUrl;
        }
        await event.save();
        return res.status(200).json(event);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

async function inviteVolunteer(req, res) {
    const { id: eventId } = req.params;
    const filter = {};
    try {
        const event = await Event.findById(eventId);
        console.log(event.categories);
        filter.interests = { $in: event.categories };
        const userToInvite = await User.find(filter);
        userToInvite.forEach(async (item) => {
            await sendEmail(
                item.email,
                'Event Invetation', // subject
                `${event.title} is an event that you may be interested in attending.` // text
            );
        });
        return res.sendStatus(200);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
async function joinedVolunteers(req, res) {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        const joinedUser = await Event.findOne({
            $and: [
                { _id: req.params.id },
                {
                    confirmedVolunteers: { $in: req.user.id },
                },
            ],
        });
        if (joinedUser) {
            return res.status(400).json({ message: 'User already joined' });
        }
        await Event.findByIdAndUpdate(req.params.id, {
            $push: { confirmedVolunteers: req.user.id },
        });
        await User.findByIdAndUpdate(req.user.id, {
            $push: { followedEvents: req.params.id },
        });
        return res.status(201).json({ message: 'Joined Successfully' });
    } catch (err) {
        return res.sendStatus(500);
    }
}
const createEvent = async (req, res) => {
    try {
        const event = await Event.create({
            publisherId: req.user.id,
            title: req.body.title,
            content: req.body.content,
            date: req.body.date,
            category: req.body.category,
            address: req.body.address,
            location: req.body.location,
            coverImage: 'placeholder',
        });

        const imageUrl = await uploadImage(
            req.file,
            `${EVENT_IMAGE_DIR}/${event.id}.${getFileExtension(
                req.file.originalname
            )}`
        );
        event.coverImage = imageUrl;
        await event.save();

        await BaseUser.findByIdAndUpdate(req.user.id, {
            $push: { createdEvents: event.id },
        });

        const requiredUserField = [
            'id',
            'firstName',
            'lastName',
            'email',
            'profileImage',
        ];

        // pubulate the event with the publisher
        const populatedEvent = await Event.findById(event.id).populate(
            'publisherId',
            requiredUserField.join(' ')
        );

        res.status(201).json(populatedEvent);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

async function getEventById(req, res) {
    const { id } = req.params;
    try {
        const requiredUserField = [
            'id',
            'firstName',
            'lastName',
            'email',
            'profileImage',
        ];
        const event = await Event.findById(id)
            .populate('publisherId', requiredUserField.join(' '))
            .populate('confirmedVolunteers', requiredUserField.join(' '))
            .populate('invitedVolunteers', requiredUserField.join(' '));
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        return res.status(200).json(event);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = {
    getEvents,
    getEventById,
    deleteEvent,
    updateEvent,
    inviteVolunteer,
    joinedVolunteers,
    createEvent,
};
