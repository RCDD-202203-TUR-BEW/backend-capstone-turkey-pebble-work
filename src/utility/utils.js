const moment = require('moment');
const mongoose = require('mongoose');
const Event = require('../models/event');
const variables = require('./variables');

function getFileExtension(fileName) {
    return fileName.split('.').pop();
}

async function addDummyEventData() {
    const mockEvents = [];
    // eslint-disable-next-line no-plusplus
    for (let i = 1; i < 10 + 1; i++) {
        mockEvents.push({
            publisherId: mongoose.Types.ObjectId(),
            title: `Event ${i}`,
            content: `Event ${i} content`,
            coverImage:
                'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60',
            date: moment('2022-01-01', 'YYYY-MM-DD')
                .add(i - 1, 'days')
                .format('YYYY-MM-DD'), // adding i days to the current date
            categories: variables.CATEGORIES.slice(i - 1, i + 1),
            address: {
                city: variables.CITIES[Math.floor(i / 2)],
                country: 'Turkey',
                addressLine: 'Sokak No.1',
            },
            location: {
                lat: 41.01,
                log: 28.97,
            },
        });
    }
    await Event.create(mockEvents);
}

module.exports = {
    getFileExtension,
    addDummyEventData,
};
