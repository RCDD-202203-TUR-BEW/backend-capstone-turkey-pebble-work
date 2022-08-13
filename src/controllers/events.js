const Event = require('../models/event');
const { BaseUser } = require('../models/user');
const { uploadImage } = require('../db/storage');
const { getFileExtension } = require('../utility/utils');
const { EVENT_IMAGE_DIR } = require('../utility/variables');

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

module.exports = {
    createEvent,
};
