const request = require('supertest');
const app = require('../../app');
const Fund = require('../../models/fund');
const connectToMongo = require('../../db/connection');

describe('PUT /api/event/:id', () => {
    let validFund;

    beforeAll(async () => {
        await connectToMongo();
        validFund = await Fund.create({
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
        });
    });

    afterAll(async () => {
        await Fund.deleteMany({});
    });

    it('POST /api/fund/:id/donate should return error if the id is not valid', async () => {
        const response = await request(app)
            .post('/api/fund/invalid_id/donate')
            .send({
                amount: '100',
            });

        expect(response.status).toBe(422);
    });
    it('POST /api/fund/:id/donate should return error if no "amount" value was passed', async () => {
        const response = await request(app).post(
            `/api/fund/${validFund.id}/donate`
        );
        expect(response.status).toBe(422);
    });
    it('POST /api/fund/:id/donate should add a new donation object to the donations array of the fund', async () => {
        const response = await request(app)
            .post(`/api/fund/${validFund.id}/donate`)
            .send({
                amount: '100',
            });
        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Donation successful');
    });
});
