/* eslint-disable consistent-return */
const request = require('supertest');

const app = require('../../app');
const connectToMongo = require('../../db/connection');

beforeAll(async () => {
    // connect to test database
    await connectToMongo();
});

const funds = [
    {
        _id: '62e054bc598fb3f77c7e8af6',
        publisherId: '62e054bc598fb3f77c7e8af7',
        category: ['No Poverty', 'Zero Hunger'],
        content: 'lalalalalalalalala',
    },
    {
        _id: '62bb828a6633820dbeccdc38',
        publisherId: '',
        category: ['Quality Education', 'Zero Hunger'],
        content: 'maamamamamma',
    },
];

describe('Funds ', () => {
    it('GET /api/funds should fetch all funds', (done) => {
        request(app)
            .get('/api/funds')
            .expect('Content-Type', /json/)
            .expect(200, (err, res) => {
                if (err) return done(err);
                expect(res.body[0].content).toEqual('lalalalalalalalala');
                done();
            });
    });
    it('GET /api/funds should filter funds by id', (done) => {
        request(app)
            .get(`/api/funds?publisherId=62e054bc598fb3f77c7e8af7`)
            .set('Content-Type', 'application/json')
            .expect(200, (err, res) => {
                if (err) return done(err);
                expect(res.body[0].content).toEqual('lalalalalalalalala');
                done();
            });
    });
    it('GET /api/funds should filter funds by category', (done) => {
        request(app)
            .get(`/api/funds?category=No Poverty`)
            .set('Content-Type', 'application/json')
            .expect(200, (err, res) => {
                if (err) return done(err);
                expect(res.body[0].content).toEqual('lalalalalalalalala');
                done();
            });
    });

    it('GET /api/funds should give error when category not provided correctly', (done) => {
        request(app)
            .get('/api/funds?category=none')
            .expect('Content-Type', /json/)
            .expect(500, (err, res) => {
                if (err) return done(err);
                done();
            });
    });
    it('GET /api/funds should give error when id not provided correctly', (done) => {
        request(app)
            .get('/api/funds?publisherId=0')
            .expect('Content-Type', /json/)
            .expect(422, (err, res) => {
                if (err) return done(err);
                done();
            });
    });
    it('GET /api/funds should give error when id not in the database', (done) => {
        request(app)
            .get('/api/funds?publisherId=62bb828a6633870dbeccdc38')
            .expect('Content-Type', /json/)
            .expect(500, (err, res) => {
                if (err) return done(err);
                done();
            });
    });
});
