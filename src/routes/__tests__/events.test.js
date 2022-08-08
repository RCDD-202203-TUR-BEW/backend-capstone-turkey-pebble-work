const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const Event = require('../../models/event');
const { User } = require('../../models/user');
const connectToMongo = require('../../db/connection');
const storage = require('../../db/storage');

const mockUploadImage = jest.spyOn(storage, 'uploadImage');
mockUploadImage.mockReturnValue(Promise.resolve('https://test.com/test.jpg'));

const TEST_IMAGE_PATH = `${__dirname}/test_image.jpg`;

jest.setTimeout(30000);

let jwtToken;
let dummyEvent;
let dummyUser;

async function createDummyData() {
    // create new user and get jwt token
    const validUser = {
        email: 'test@gmail.com',
        password: '12345678',
        firstName: 'Nur',
        lastName: 'Sh',
        dateOfBirth: '2000-01-01',
        gender: 'male',
        interests: ['No Poverty', 'Zero Hunger'],
        preferredCities: ['Adana', 'Kocaeli'],
    };
    const res = await request(app)
        .post('/api/auth/user/signup')
        .field(validUser)
        .attach('profileImage', TEST_IMAGE_PATH);
    [jwtToken] = res.headers['set-cookie'][0].split(';');

    dummyUser = await User.findOne({ email: validUser.email });

    // create dummy event
    await Event.create({
        publisherId: dummyUser.id,
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
        location: {
            lat: 1,
            log: 1,
        },
    });
    dummyEvent = await Event.findOne({ puplisherId: dummyUser.id });
}

beforeAll(async () => {
    await connectToMongo();
    await createDummyData();
});

afterAll(async () => {
    await Event.deleteMany({});
    await User.deleteMany({});
});

describe('Post api/event/:id/volunteer to join voulnteers', () => {
    it('Should reture 201 status when joined successfully', async () => {
        const res = await request(app)
            .post(`/api/event/${dummyEvent.id}/volunteers`)
            .set('Content-Type', 'application/json')
            .set('Cookie', [jwtToken]);

        const UpdatedDummyEvent = await Event.findOne({
            puplisherId: dummyUser.id,
        });
        expect(res.status).toBe(201);
        expect(res.body.message).toBe('Joined Successfully');
        expect(UpdatedDummyEvent.confirmedVolunteers[0].toString()).toBe(
            dummyUser.id
        );
    });

    it('Should reture 401 status when user not authorized', async () => {
        await request(app)
            .post(`/event/${dummyEvent.id}/volunteers`)
            .set('Content-Type', 'application/json')
            .then((response) => {
                expect(response.status).toBe(401);
            });
    });

    it('Should reture 404 status when id not found', async () => {
        const wrongId = '62e980586aca79a3936917ef';
        await request(app)
            .post(`/api/event/${wrongId}/volunteers`)
            .set('Content-Type', 'application/json')
            .set('Cookie', [jwtToken])
            .then((response) => {
                expect(response.status).toBe(404);
                expect(response.body.message).toBe('Event not found');
            });
    });

    it('Should reture 400 status when user already joined the event', async () => {
        await request(app)
            .post(`/api/event/${dummyEvent.id}/volunteers`)
            .set('Content-Type', 'application/json')
            .set('Cookie', [jwtToken])
            .then((response) => {
                expect(response.status).toBe(400);
                expect(response.body.message).toBe('User already joined');
            });
    });
});
