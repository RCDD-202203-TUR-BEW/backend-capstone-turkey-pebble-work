const Event = require('../models/event')
const { uploadImage } = require('../db/storage')
const { getFileExtension } = require('../utility/utils');
const {COVER_IMAGE_DIR} = require('../utility/variables')

const createEvent = async (req, res) => {
    try {
        const imageUrl = await uploadImage(
            req.file,
            `${COVER_IMAGE_DIR}/${Date.now()}.${getFileExtension(
                req.file.originalname
            )}`
        );
        const event = await new Event({
            publisherId: req.user.id,
            title: req.body.title,
            content: req.body.content,
            coverImage: imageUrl,
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
        }).save()
        res.status(201).json(event)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
};

module.exports = {
    createEvent
}
