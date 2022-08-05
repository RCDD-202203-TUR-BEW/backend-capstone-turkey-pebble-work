const request = require('supertest');
const moment = require('moment');
const app = require('../../app');
const Event = require('../../models/event');
const connectToMongo = require('../../db/connection');
const { addDummyEventData } = require('../../utility/utils');

beforeAll(async () => {
    // connect to test database
    await connectToMongo();
    // add dummy data
    await addDummyEventData();
});

afterAll(async () => {
    // clean up database
    await Event.deleteMany({});
});

jest.setTimeout(10000);

describe('Get and filter events', () => {
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
