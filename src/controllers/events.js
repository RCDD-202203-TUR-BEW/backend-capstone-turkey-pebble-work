const Event = require('../models/event');
const { User } = require('../models/user');

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

module.exports = {
    joinedVolunteers,
};
