const request = require('supertest');
const app = require('../../app');
const connectToMongo = require('../../db/connection');
const Funds = require('../../models/fund');

const validFund1 = {
    publisherId: '62e054bc598fb3f77c7e8af7',
    title: 'Fund 1',
    content: 'lalalalalalalalala',
    categories: ['No Poverty', 'Zero Hunger'],
    targetFund: '100',
    address: {
        city: 'Istanbul',
        country: 'Turkey',
        addressLine: 'address line',
    },
};
const validFund2 = {
    publisherId: '62e054bc598fb3f77c7e8af9',
    title: 'Fund 2',
    content: 'lalalalalalalalala',
    categories: ['Animals'],
    targetFund: '200',
    address: {
        city: 'Bursa',
        country: 'Turkey',
        addressLine: 'address line 2',
    },
};
let fundId;

beforeAll(async () => {
    await connectToMongo();
    const fund1 = await Funds.create(validFund1);
    fundId = fund1.id;
    await Funds.create(validFund2);
});

afterAll(async () => {
    await Funds.deleteMany({});
});

describe('Get and filter funds', () => {
    it('GET /api/fund/ should get all funds', async () => {
        const res = await request(app)
            .get('/api/fund/')
            .expect('Content-Type', /json/);
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(2);
        expect(res.body[0].content).toEqual('lalalalalalalalala');
    });
    it('GET /api/fund/ should filter funds by id', (done) => {
        request(app)
            .get(`/api/fund/?publisherId=${validFund1.publisherId}`)
            .set('Content-Type', 'application/json')
            .expect(200, (err, res) => {
                if (err) return done(err);
                expect(res.body[0].title).toEqual(validFund1.title);
                return done();
            });
    });
    it('GET /api/fund/ should filter funds by category', (done) => {
        request(app)
            .get(`/api/fund/?categories[]=No Poverty`)
            .set('Content-Type', 'application/json')
            .expect(200, (err, res) => {
                if (err) return done(err);
                expect(res.body[0].title).toEqual(validFund1.title);
                return done();
            });
    });
    it('GET /api/fund/ should give error when category not provided correctly', (done) => {
        request(app)
            .get('/api/fund/?categories[]=none')
            .expect('Content-Type', /json/)
            .expect(422, (err, res) => {
                if (err) return done(err);
                return done();
            });
    });
    it('GET /api/fund/ should give error when id not provided correctly', (done) => {
        request(app)
            .get('/api/fund/?publisherId=0')
            .expect('Content-Type', /json/)
            .expect(422, (err, res) => {
                if (err) return done(err);
                return done();
            });
    });
    it('GET /api/fund/ should give an empty array when id not in the database', (done) => {
        request(app)
            .get('/api/fund/?publisherId=62bb828a6633870dbeccdc38')
            .expect('Content-Type', /json/)
            .expect(200, (err, res) => {
                if (err) return done(err);
                expect(res.body.length).toEqual(0);
                return done();
            });
    });
});

describe('Get funds by id ', () => {
    it('GET /api/fund:id should filter funds by id', (done) => {
        // const id = '619b77dd5c639f35dd2d37c4';
        request(app)
            .get(`/api/fund/${fundId}`)
            .set('Content-Type', 'application/json')
            .expect('Content-type', /json/)
            .expect(200, (err, res) => {
                if (err) return done(err);
                expect(res.body.title).toEqual('Fund 1');
                return done();
            });
    });
    it('GET /api/fund should give error when id not provided correctly', (done) => {
        request(app)
            .get('/api/fund/0')
            .expect('Content-Type', /json/)
            .expect(422, (err, res) => {
                if (err) return done(err);
                return done();
            });
    });
    it('GET /api/fund/ should give an empty array when id not in the database', (done) => {
        request(app)
            .get('/api/fund/62bb828a0633870dbec9dc38')
            .expect('Content-Type', /json/)
            .expect(404, (err, res) => {
                if (err) return done(err);
                return done();
            });
    });
});
