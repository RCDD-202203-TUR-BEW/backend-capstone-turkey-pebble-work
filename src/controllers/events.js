const _ = require('lodash');
const mongoose = require('mongoose');
const Event = require('../models/event');
const { addDummyEventData } = require('../utility/utils');

async function getEvents(req, res) {
    // await addDummyEventData();
    try {
        // between filter options there is an implicit AND operator
        const filter = {};

        // gets the event if one of the categories passed is in the event
        if (req.query.categories) {
            filter.categories = { $in: req.query.categories };
        }

        if (req.query.city) {
            filter['address.city'] = req.query.city;
        }

        if (req.query.publisherId) {
            filter.publisherId = mongoose.Types.ObjectId(req.query.publisherId);
        }

        // due to the validation, we are sure that "fromDate" and "toDate" are defined togheter
        if (req.query.fromDate) {
            filter.date = { $gte: req.query.fromDate, $lte: req.query.toDate };
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

        // due to the validation, we are sure that "from" and "to" are defined togheter
        if (req.query.from) {
            const limit = _.parseInt(req.query.to) - _.parseInt(req.query.from);
            const skip = _.parseInt(req.query.from);
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

module.exports = {
    getEvents,
};
