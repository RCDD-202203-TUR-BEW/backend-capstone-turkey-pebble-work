const { getFunds } = require('../funds');
const fundModel = require('../../models/fund');

const funds = [
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

jest.mock('../../models/fund');
fundModel.find = jest.fn().mockImplementation(() => funds);
describe('Fund controller', () => {
    it('should return all funds', async () => {
        const req = { query: {} };
        const res = {
            status: jest.fn(),
            json: jest.fn(),
        };
        await getFunds(req, res);

        expect(res.json).toHaveBeenCalledWith(funds);
        expect(fundModel.find).toHaveBeenCalled();
        expect(fundModel.find).toReturnWith(funds);
    });

    it('should return a specific fund by id', async () => {
        fundModel.find = jest.fn().mockImplementation(() => funds[0]);

        const req = {
            query: {
                publisherId: '62e054bc598fb3f77c7e8af7',
            },
        };
        const res = {
            status: jest.fn(),
            json: jest.fn(),
        };
        await getFunds(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(funds[0]);
        expect(fundModel.find).toHaveBeenCalled();
        expect(fundModel.find).toReturnWith(funds[0]);
    });

    it('should return a specific fund by category', async () => {
        fundModel.find = jest.fn().mockImplementation(() => funds[0]);

        const req = {
            query: {
                category: 'No Poverty',
            },
        };
        const res = {
            status: jest.fn(),
            json: jest.fn(),
        };
        await getFunds(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(funds[0]);
        expect(fundModel.find).toHaveBeenCalled();
        expect(fundModel.find).toReturnWith(funds[0]);
    });
});
