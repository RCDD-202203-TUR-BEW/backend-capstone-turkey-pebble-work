/* eslint-disable consistent-return */
const request = require('supertest');

const app = require('../../app');
const connectToMongo = require('../../db/connection');

beforeAll(async () => {
    // connect to test database
    await connectToMongo();
});

const fund = [
    {
        _id: '62e054bc598fb3f77c7e8af6',
        publisherId: '62e054bc598fb3f77c7e8af7',
        category: ['No Poverty', 'Zero Hunger'],
        content: 'lalalalalalalalala',
    },
    {
        _id: '62bb828a6633820dbeccdc38',
        publisherId: '62e054bc598fb3f77c7e8af9',
        category: ['Quality Education', 'Zero Hunger'],
        content: 'content1',
    },
];

describe('Funds ', () => {
    it('GET /api/funds should return funds filtered by categories and publisherId', (done) => {
        request(app)
            .get(`/api/funds?publisherId=62e054bc598fb3f77c7e8af7`)
            .set('Content-Type', 'application/json')
            .expect(200, (err, res) => {
                if (err) return done(err);
                expect(res.body.content).toEqual('lalalalalalalalala');
                done();
            });
    });
});
