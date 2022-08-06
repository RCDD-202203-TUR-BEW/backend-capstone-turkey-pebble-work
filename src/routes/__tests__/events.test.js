const request = require('supertest');
const moment = require('moment');
const mongoose = require('mongoose');
const app = require('../../app');
const Event = require('../../models/event');
const { User, Token } = require('../../models/user');
const connectToMongo = require('../../db/connection');
const { addDummyEventData } = require('../../utility/utils');
const storage = require('../../db/storage');

const TEST_IMAGE_PATH = `${__dirname}/test_image.jpg`;

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

    it('GET /api/event/ should return events of the specified categories', async () => {
        const response = await request(app).get(
            '/api/event/?categories[]=No Poverty&categories[]=Zero Hunger'
        );
        expect(response.status).toBe(200);
        expect(response.body).toBeDefined();
        response.body.forEach((event) => {
            expect(
                event.categories.some((category) =>
                    ['No Poverty', 'Zero Hunger'].includes(category)
                )
            ).toBeTruthy();
        });
    });

    it('GET /api/event/ should return events of the specified city', async () => {
        const response = await request(app).get('/api/event/?city=Istanbul');
        expect(response.status).toBe(200);
        expect(response.body).toBeDefined();
        response.body.forEach((event) => {
            expect(event.address.city).toBe('Istanbul');
        });
    });

    it('GET /api/event/ should return events of the specified publisherId', async () => {
        const existingEvent = await Event.findOne({});
        const response = await request(app).get(
            `/api/event/?publisherId=${existingEvent.publisherId}`
        );
        expect(response.status).toBe(200);
        expect(response.body).toBeDefined();
        response.body.forEach((event) => {
            // null since the publisherId could be just a placeholder, and when populated, it will null
            expect([existingEvent.publisherId.toString(), null]).toContain(
                event.publisherId
            );
        });
    });

    it('GET /api/event/ should return events of the specified date range', async () => {
        const response = await request(app).get(
            '/api/event/?fromDate=2022-01-01&toDate=2022-01-05'
        );
        expect(response.status).toBe(200);
        expect(response.body).toBeDefined();
        response.body.forEach((event) => {
            expect(
                moment(moment(event.date).format('YYYY-MM-DD')).isBetween(
                    moment('2022-01-01'), // fromDate
                    moment('2022-01-05'), // toDate
                    undefined,
                    '[]' // [] means that the start and end dates are included in the range
                )
            ).toBeTruthy();
        });
    });

    it('GET /api/event/ should return events of the specified range ordered by date', async () => {
        const response = await request(app).get('/api/event/?from=0&to=5');
        expect(response.status).toBe(200);
        expect(response.body).toBeDefined();
        expect(response.body.length).toBe(5);
        response.body.forEach((event, index) => {
            // in the dummy data, the events' dates start from 2022-01-01
            expect(moment(event.date).format('YYYY-MM-DD')).toBe(
                moment(`2022-01-0${index + 1}`).format('YYYY-MM-DD')
            );
        });
    });

    it('GET /api/event/ should perform an AND operation on the specified filters', async () => {
        const response = await request(app).get(
            '/api/event/?categories[]=Zero Hunger&city=Adana'
        );
        expect(response.status).toBe(200);
        expect(response.body).toBeDefined();
        response.body.forEach((event) => {
            expect(
                event.categories.some((category) =>
                    ['No Poverty', 'Zero Hunger'].includes(category)
                )
            ).toBeTruthy();
            expect(event.address.city).toBe('Adana');
        });
        // TODO: ask halit if you should do this for every compination of filters
    });

    it('GET /api/event/ should return an error if "from" is provided but not "to" and vice verse', async () => {
        const response = await request(app).get('/api/event/?from=0');
        expect(response.status).toBe(422);
        const response2 = await request(app).get('/api/event/?to=5');
        expect(response2.status).toBe(422);
    });

    it('GET /api/event/ should return an error if "from" is greater than "to"', async () => {
        const response = await request(app).get('/api/event/?from=5&to=0');
        expect(response.status).toBe(422);
    });

    it('GET /api/event/ should return an error if "fromDate" provided but not "toDate" and vice verse', async () => {
        const response = await request(app).get(
            '/api/event/?fromDate=2022-01-01'
        );
        expect(response.status).toBe(422);
        const response2 = await request(app).get(
            '/api/event/?toDate=2022-01-05'
        );
        expect(response2.status).toBe(422);
    });

    it('GET /api/event/ should return an error if "fromDate" is greater than "toDate"', async () => {
        const response = await request(app).get(
            '/api/event/?fromDate=2022-01-05&toDate=2022-01-01'
        );
        expect(response.status).toBe(422);
    });

    it('GET /api/event/ should return an errors if the optional filter properties are not valid', async () => {
        const properties = [
            'from',
            'to',
            'fromDate',
            'toDate',
            'categories',
            'city',
            'publisherId',
        ];
        const response = await request(app).get(
            '/api/event/?from=a&to=b&fromDate=c&toDate=d&categories[]=BlaBla&city=Halep&publisherId=lalala'
        );
        expect(response.status).toBe(422);
        properties.forEach((property) => {
            expect(
                response.body.errors.find((error) => error.param === property)
            ).toBeDefined();
        });
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
            category: 'No Poverty',
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
            category: 'No Poverty',
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
