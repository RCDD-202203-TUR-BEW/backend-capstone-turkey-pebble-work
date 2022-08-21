/* eslint-disable consistent-return */
const request = require('supertest');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const app = require('../../app');
const Event = require('../../models/event');
const { User, Token } = require('../../models/user');
const connectToMongo = require('../../db/connection');
const { addDummyEventData } = require('../../utility/utils');
const storage = require('../../db/storage');
const variables = require('../../utility/variables');

const TEST_IMAGE_PATH = `${__dirname}/test_image.jpg`;
const PDF_PATH = `${__dirname}/invalid_image.pdf`;

const mockUploadImage = jest.spyOn(storage, 'uploadImage');
mockUploadImage.mockReturnValue(Promise.resolve('https://test.com/test.jpg'));

describe('Get and filter events', () => {
    jest.setTimeout(10000);
    beforeAll(async () => {
        // connect to test database
        await connectToMongo();
        // add dummy data
        await addDummyEventData();
    });
    afterAll(async () => {
        // clean up database
        await User.deleteMany({});
        await Event.deleteMany({});
        await Token.deleteMany({});
    });
    it('GET /api/event/ should return all events if no filter is passed', async () => {
        const response = await request(app).get('/api/event/');
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(10);
    });
});

describe('DELETE /api/event/:id', () => {
    const dummyUsers = [];
    let dummyEvents;
    jest.setTimeout(30000);
    let jwtToken;
    let fakeJwtToken;

    beforeAll(async () => {
        // connect to test database
        await connectToMongo();
        // add dummy data
        await addDummyEventData();

        // create 2 dummy users
        const validUser1 = {
            email: 'test@gmail.com',
            password: '12345678',
            firstName: 'Nur',
            lastName: 'Sh',
            dateOfBirth: '2000-01-01',
            gender: 'male',
            interests: ['No Poverty', 'Zero Hunger'],
            preferredCities: ['Adana', 'Kocaeli'],
            jwtToken: '',
        };
        const validUser2 = {
            email: 'test2@gmail.com',
            password: '12345678',
            firstName: 'Nur2',
            lastName: 'Sh2',
            dateOfBirth: '2000-01-02',
            gender: 'male',
            interests: ['No Poverty', 'Zero Hunger'],
            preferredCities: ['Adana', 'Kocaeli'],
            jwtToken: '',
        };
        const res = await request(app)
            .post('/api/auth/user/signup')
            .field(validUser1)
            .attach('profileImage', TEST_IMAGE_PATH);
        await request(app)
            .post('/api/auth/user/signup')
            .field(validUser2)
            .attach('profileImage', TEST_IMAGE_PATH);

        const user1 = await User.findOne({ email: validUser1.email });
        const user2 = await User.findOne({ email: validUser2.email });
        dummyUsers.push(user1);
        dummyUsers.push(user2);

        [jwtToken] = res.headers['set-cookie'][0].split(';');
        fakeJwtToken =
            'auth_token=s%3Aenc%3A%3Ab0de5ba434319f6d38564251800cddf6afe3bb9f947f6c9533ed18ba7a670198522f4840b5981b2cb03ad978eab47391ff506db13c616506c92aa60c9230dc9157f977359eedb681085faafa2ce4666a7307fa72fe140b3091556b47f1a474de38373535399d772bd5fb5935e634c11a7222f5f7b9d1adbc4d19f3e957b9909be05fd487cca66c5b3d9775b993035b7e188b038d2cd4b6abcc34ca4644f2ce6e342d825e7afc9f325882f9915231e43e2ac1d0a86b415c103e71dda8ed69ada71c6740a4b768f14ed796b7356ead449dfbb48bac038df3b7fef5120a542c2393b8d15b0ae7703c343f0a84755f0bfe601028ab00bbcfa929d7bb9eba33b7fad840a32ab99a5abf8a24bb7946b307a01fa8be3b824ce1e43f035907cd558236da3fb4ec28dd92ff0ff01246dcf38ea8871e0a44182cd92ae73185b834e80a7e66c36670b01c0d19947965f0dedecd23a3.Ag5oz0IlbfbeqHD%2BeAcZjhwUpPP0ZQKRIzBaCOxDG34';

        // create 2 dummy events
        await Event.create({
            publisherId: mongoose.Types.ObjectId(dummyUsers[0].id),
            title: 'title 1',
            content: 'new content 1',
            coverImage: 'coverImage 1',
            date: '2023-01-01',
            categories: ['No Poverty'],
            confirmedVolunteers: [
                mongoose.Types.ObjectId(dummyUsers[0].id),
                mongoose.Types.ObjectId(dummyUsers[1].id),
            ],
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

        await Event.create({
            publisherId: mongoose.Types.ObjectId(dummyUsers[0].id),
            title: 'title 2',
            content: 'new content 2',
            coverImage: 'coverImage 2',
            date: '2023-01-01',
            categories: ['No Poverty'],
            confirmedVolunteers: [
                mongoose.Types.ObjectId(dummyUsers[0].id),
                mongoose.Types.ObjectId(dummyUsers[1].id),
            ],
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

        dummyEvents = await Event.find({
            publisherId: dummyUsers[0].id,
        }); // 2 events

        dummyUsers[0].createdEvents.push(
            mongoose.Types.ObjectId(dummyEvents[0].id)
        );
        dummyUsers[0].createdEvents.push(
            mongoose.Types.ObjectId(dummyEvents[1].id)
        );

        dummyUsers[0].followedEvents.push(
            mongoose.Types.ObjectId(dummyEvents[0].id)
        );
        dummyUsers[0].followedEvents.push(
            mongoose.Types.ObjectId(dummyEvents[1].id)
        );
        dummyUsers[1].followedEvents.push(
            mongoose.Types.ObjectId(dummyEvents[0].id)
        );
        dummyUsers[1].followedEvents.push(
            mongoose.Types.ObjectId(dummyEvents[1].id)
        );

        await dummyUsers[0].save();
        await dummyUsers[1].save();
    });

    afterAll(async () => {
        // clean up database
        await User.deleteMany({});
        await Event.deleteMany({});
        await Token.deleteMany({});
    });
    it('DELETE /api/event/:id should return an error if a user is not the creator of that event', async () => {
        const response = await request(app)
            .delete(`/api/event/${dummyEvents[0].id}`)
            .set('Cookie', fakeJwtToken); // dummyUsers[1] is not the creator of the event
        expect(response.status).toBe(403);
    });

    it('DELETE /api/event/:id should return an error if no auth_token is passed', async () => {
        const response = await request(app).delete(
            `/api/event/${dummyEvents[0].id}`
        );
        expect(response.status).toBe(401);
    });

    it('DELETE /api/event/:id should return an error passed an invalid id', async () => {
        const response = await request(app)
            .delete(`/api/event/123`)
            .set('Cookie', jwtToken);
        expect(response.status).toBe(422);
    });

    it("DELETE /api/event/:id should delete the event and all of it's references in other collections", async () => {
        const response = await request(app)
            .delete(`/api/event/${dummyEvents[0].id}`)
            .set('Cookie', jwtToken);
        expect(response.status).toBe(204);
        const deletedEvent = await Event.findById(dummyEvents[0].id);
        expect(deletedEvent).toBeNull();
        const user1 = await User.findById(dummyUsers[0].id);
        expect(user1.createdEvents.length).toBe(1);
        expect(user1.createdEvents[0].toString()).toBe(dummyEvents[1].id);
        expect(user1.followedEvents.length).toBe(1);
        expect(user1.followedEvents[0].toString()).toBe(dummyEvents[1].id);
        const user2 = await User.findById(dummyUsers[1].id);
        expect(user2.followedEvents.length).toBe(1);
        expect(user2.followedEvents[0].toString()).toBe(dummyEvents[1].id);
    });
});

describe('PUT /api/event/:id', () => {
    jest.setTimeout(30000);
    let jwtToken;
    let dummyEvent;
    const newEventData = {
        title: 'new title',
        content: 'new content',
        date: '2023-01-01',
        categories: ['No Poverty', 'Animals'],
        confirmedVolunteers: ['62e980586aca79a3936917f9'],
        invitedVolunteers: ['62e980586aca79a3936917f8'],
        address: {
            city: 'NY',
            country: 'USA',
            addressLine: 'new addressLine',
        },
        location: {
            lat: 2,
            log: 2,
        },
    };

    beforeAll(async () => {
        await connectToMongo();
        // create 2 dummy users
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

        const hashedPassword = await bcrypt.hash(
            validUser.password,
            variables.HASH_ROUNDS
        );

        const user = await new User({
            email: validUser.email,
            hashedPassword,
            firstName: validUser.firstName,
            lastName: validUser.lastName,
            dateOfBirth: validUser.dateOfBirth,
            preferredCities: validUser.preferredCities,
            interests: validUser.interests,
            gender: validUser.gender,
        }).save();

        const payload = {
            id: user.id,
            email: user.email,
            // if organization, fullName is the same as name
            fullName: user.fullName,
        };

        jwtToken = jwt.sign(payload, process.env.SECRET_KEY, {
            expiresIn: variables.FOURTEEN_DAYS_STRING,
        });

        jwtToken = `auth_token=${jwtToken}`;

        dummyEvent = await Event.create({
            publisherId: mongoose.Types.ObjectId(user.id),
            title: 'title 1',
            content: 'new content 1',
            coverImage: 'coverImage 1',
            date: '2023-01-01',
            categories: ['No Poverty', 'Youth'],
            confirmedVolunteers: [mongoose.Types.ObjectId(user.id)],
            invitedVolunteers: [mongoose.Types.ObjectId(user.id)],
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
    });

    afterAll(async () => {
        // clean up database
        await User.deleteMany({});
        await Event.deleteMany({});
        await Token.deleteMany({});
    });

    it('PUT /api/event/:id should return an error if no auth_token is passed', async () => {
        const response = await request(app).put(`/api/event/${dummyEvent.id}`);
        expect(response.status).toBe(401);
    });

    it('PUT /api/event/:id should return an error if an invalid id is passed', async () => {
        const response = await request(app)
            .put(`/api/event/123`)
            .set('Cookie', jwtToken);
        expect(response.status).toBe(422);
    });

    it('PUT /api/event/:id should return an error if one of the passed optional properties is invalid', async () => {
        const optionalProperties = [
            'date',
            'categories',
            'confirmedVolunteers',
            'invitedVolunteers',
            'address',
            'location',
            'coverImage',
        ];
        const invalidEventData = {
            title: JSON.stringify({}),
            content: JSON.stringify({}),
            date: 123,
            categories: JSON.stringify(['invalid category']),
            confirmedVolunteers: JSON.stringify([123, 'invalid id']),
            invitedVolunteers: JSON.stringify([123, 'invalid id']),
            address: JSON.stringify({
                city: 123,
                country: 123,
                addressLine: 123,
            }),
            location: JSON.stringify({
                lat: 'abs',
                log: 'abs',
            }),
        };

        const response = await request(app)
            .put(`/api/event/${dummyEvent.id}`)
            .field(invalidEventData)
            .attach('coverImage', PDF_PATH)
            .set('Cookie', jwtToken);
        expect(response.status).toBe(422);
        optionalProperties.forEach((property) => {
            expect(
                response.body.errors.find((error) => error.param === property)
            ).toBeDefined();
        });
    });

    it('PUT /api/event/:id should return an correctly updated event', async () => {
        const response = await request(app)
            .put(`/api/event/${dummyEvent.id}`)
            .field('title', newEventData.title)
            .field('content', newEventData.content)
            .field('date', newEventData.date)
            .field('categories[]', newEventData.categories[0])
            .field('categories[]', newEventData.categories[1])
            .field('confirmedVolunteers[]', newEventData.confirmedVolunteers[0])
            .field('invitedVolunteers[]', newEventData.invitedVolunteers[0])
            .field('address[city]', newEventData.address.city)
            .field('address[country]', newEventData.address.country)
            .field('address[addressLine]', newEventData.address.addressLine)
            .field('location[lat]', newEventData.location.lat)
            .field('location[log]', newEventData.location.log)
            .attach('coverImage', TEST_IMAGE_PATH)
            .set('Cookie', jwtToken);
        expect(response.status).toBe(200);
        expect(response.body.title).toBe(newEventData.title);
        expect(response.body.content).toBe(newEventData.content);
        expect(response.body.date.slice(0, 10)).toBe(newEventData.date);
        expect(response.body.categories).toEqual(newEventData.categories);
        expect(response.body.confirmedVolunteers).toEqual(
            newEventData.confirmedVolunteers
        );
        expect(response.body.invitedVolunteers).toEqual(
            newEventData.invitedVolunteers
        );
        expect(response.body.address).toEqual(newEventData.address);
        expect(response.body.location).toEqual(newEventData.location);
        expect(response.body.coverImage).toBeDefined();
    });

    it('PUT /api/event/:id should return an error if the user is not the publisher of the event', async () => {
        dummyEvent.publisherId = mongoose.Types.ObjectId(
            '62e980586aca79a3936917f7' // different than the user id
        );
        await dummyEvent.save();
        const response = await request(app)
            .put(`/api/event/${dummyEvent.id}`)
            .set('Cookie', jwtToken);
        expect(response.status).toBe(403);
    });
});

describe('POST /api/event/:id/volunteers', () => {
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

describe('Fetching events by id', () => {
    const validEvent = {
        id: '1a34',
        publisherId: '667',
        title: 'Event 1',
        content: 'Event 1 content',
        coverImage:
            'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png',
        date: '2022-01-01',
        categories: ['No Poverty', 'Zero Hunger'],
        address: {
            city: 'Adana',
            country: 'Turkey',
            addressLine: 'X mah, Adana, Turkey',
        },
        confirmedVolunteers: ['12dg4', '12dg5'],
        invitedVolunteers: ['12dg4', '12dg5', '12dg6'],
        location: {
            lat: 34.12,
            log: 34.16,
        },
    };

    beforeAll(async () => {
        await connectToMongo();
    });

    afterAll(async () => {
        await Event.deleteMany({});
    });

    jest.setTimeout(10000);

    it('GET /api/event/:id should fetch event by id and populate', async () => {
        request(app)
            .get('/api/event/:id')
            .expect('Content-Type', /json/)
            .expect(200, (err, res) => {
                if (err) return err;
                expect(res.body).toBeDefined();
                expect(res.body.id.toString()).toBe(
                    validEvent[0].id.toString()
                );
                expect(res.body.publisherId.toString()).toBeDefined();
                expect(res.body.publisherId.toString()).toBe(
                    validEvent[0].publisherId.toString()
                );
                expect(res.body.confirmedVolunteers).toBeDefined();
                expect(res.body.confirmedVolunteers).toEqual(
                    validEvent[0].confirmedVolunteers
                );
                expect(res.body.invitedVolunteers).toBeDefined();
                expect(res.body.invitedVolunteers).toEqual(
                    validEvent[0].invitedVolunteers
                );
            });
    });
    it('GET /api/event/:id should return an error if the event is not found', async () => {
        request(app)
            .get('/api/event/:id')
            .expect('Content-Type', /json/)
            .expect(404, (err, res) => {
                if (err) return err;
                expect(res.body).toBeDefined();
                expect(res.body.message).toBe('Event not found');
            });
    });
    it('GET /api/event/:id should return an error if the id is not valid', async () => {
        const id = '12dg4';
        request(app)
            .get(`/api/event/${id}`)
            .expect('Content-Type', /json/)
            .expect(404, (err, res) => {
                if (err) return err;
                expect(res.body).toBeDefined();
                expect(res.body.message).toBe('Invalid event Id');
            });
    });
});
