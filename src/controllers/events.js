/* eslint-disable consistent-return */
const eventModel = require('../models/event');

const getOneEvent = async (req, res) => {
    const { id } = req.params;
    try {
        const event = await eventModel
            .findById(id)
            .populate('publisherId')
            .populate('confirmedVolunteers')
            .populate('invitedVolunteers');
        if (!event) {
            return res.status(404).json({
                message: 'Event not found',
            });
        }
        return res.status(200).json(event);
    } catch (err) {
        return res.status(500).json({
            message: 'Error getting event',
        });
    }
};

module.exports = { getOneEvent };
