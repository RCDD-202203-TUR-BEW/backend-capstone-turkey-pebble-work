const Event = require('../models/event')
const { uploadImage } = require('../db/storage')
const { getFileExtension } = require('../utility/utils');
const { EVENT_IMAGE_DIR } = require('../utility/variables')

const createEvent = async (req, res) => {
    try {
        const event = await Event.create({
            publisherId: req.user.id,
            title: req.body.title,
            content: req.body.content,
            date: req.body.date,
            category: req.body.category,
            address: {
                city: req.body.city,
                country: req.body.country,
                addressLine: req.body.addressLine
            },
            location: {
                lat: req.body.lat,
                log: req.body.long
            }
        })

        const imageUrl = await uploadImage(
            req.file,
            `${EVENT_IMAGE_DIR}/${event.id}.${getFileExtension(
                req.file.originalname
            )}`
        );
        event.coverImage = imageUrl
        await event.save()
        res.status(201).json(event)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: err.message })
    }
};

module.exports = {
    createEvent
}
