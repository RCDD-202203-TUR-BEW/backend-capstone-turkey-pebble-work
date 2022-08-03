const request = require('supertest');
const app = require('../../app');
const Event = require('../../models/event');
const db = require('../../db/connection');

beforeAll(async () => {
    await db();
});

afterAll(async () => {
    await Event.remove({});
});

describe('Post /event/:id/join to join voulnteers', () => {
    let jwtToken;
    let id;
    let newVoulnteer;
    let newEvent;
    let event;
    beforeEach(async () => {
        event = new Event({
            title: 'title',
            content: 'new content',
            coverImage: 'coverImage',
            date: '2022-01-01',
            category: 'No Poverty',
            confirmedVolunteers: [],
            address: {
                city: 'Bursa',
                country: 'Turkey',
                addressLine: 'addressLine',
            },
        });
        await event.save();
        newEvent = {
            title: 'title',
            content: 'new content',
            coverImage: 'coverImage',
            date: '2022-01-01',
            category: 'No Poverty',
            confirmedVolunteers: newVoulnteer,
            address: {
                city: 'Bursa',
                country: 'Turkey',
                addressLine: 'addressLine',
            },
        };
        jwtToken = 'token';
        id = event.id;
        newVoulnteer = '662e652979ac3295178bdd75f';
    });

    it('Should reture 201 status when joined successfully', async () => {
        const updatedEvent = await Event.findById(event.id);
        request(app)
            .post(`/event/${updatedEvent.id}/join`)
            .set('Content-Type', 'application/json')
            .set('Cookie', [jwtToken])
            .send(newEvent)
            .then((response) => {
                expect(response.status).toBe(201);
                expect(response.body.message).toBe('Joined Successfully');
                expect(updatedEvent.confirmedVolunteers).toBe(newVoulnteer);
            });
    });

    it('Should reture 401 status when user not authorized', async () => {
        jwtToken = '';
        await request(app)
            .post(`/event/${event.id}/join`)
            .set('Content-Type', 'application/json')
            .set('Cookie', [jwtToken])
            .send(newEvent)
            .then((response) => {
                expect(response.status).toBe(401);
            });
    });

    it('Should reture 404 when id not found', async () => {
        const wrongId = '662e652979ac3295178bdd75f';
        await request(app)
            .post(`/event/${wrongId}/join`)
            .set('Content-Type', 'application/json')
            .set('Cookie', [jwtToken])
            .then((response) => {
                expect(response.status).toBe(404);
                expect(response.body.message).toBe('Link not found');
            });
    });
});
