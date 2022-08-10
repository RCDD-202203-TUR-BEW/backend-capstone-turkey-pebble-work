const EventModel = require('../models/event');
const { User } = require('../models/user');

async function unjoinedVolunteers(req, res) {
    try {
        const event = await EventModel.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        await EventModel.findByIdAndUpdate(req.params.id, {
            $pull: { confirmedVolunteers: req.user.id },
        });
        await User.findByIdAndUpdate(req.user.id, {
            $pull: { followedEvents: req.params.id },
        });
        return res.status(201).json({ message: 'Unjoined Successfully' });
    } catch (err) {
        return res.sendStatus(500);
    }
}

module.exports = {
    unjoinedVolunteers,
};
