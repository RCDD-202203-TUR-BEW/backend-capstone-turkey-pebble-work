const Event = require('../models/event')


const createEvent = (req, res) => {

    try {

        const event = await new Event({

            puplisherId: req.id,
            title: req.body.title,
            content: req.body.content,
            coverImage: req.location,
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

        res.status(201).json({ message: 'Event succesfully created' })

    } catch (err) {
        console.error(err)
    }







}


module.exports = {
    createEvent
}