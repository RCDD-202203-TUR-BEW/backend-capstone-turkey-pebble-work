// /* eslint-disable prettier/prettier */
// /* eslint-disable prefer-promise-reject-errors */
// const { getFunds } = require('../funds');
// const fundModel = require('../../models/fund');

// const funds = [
//     {
//         _id: '62e054bc598fb3f77c7e8af6',
//         publisherId: '62e054bc598fb3f77c7e8af7',
//         category: ['No Poverty', 'Zero Hunger'],
//         content: 'lalalalalalalalala',
//     },
//     {
//         _id: '62bb828a6633820dbeccdc38',
//         publisherId: '62e054bc598fb3f77c7e8af9',
//         category: ['Quality Education', 'Zero Hunger'],
//         content: 'content1',
//     },
// ];

// afterEach(() => {
//     jest.clearAllMocks();
// });

// afterAll(() => {
//     jest.restoreAllMocks();
// });

// const mockFind = jest.spyOn(fundModel, 'find');
// // eslint-disable-next-line no-useless-rename
// mockFind.mockImplementation((publisherId) => {
//     console.log(`===========>${publisherId.publisherId}`);
//     console.log(`=====+======>${funds[0].publisherId}`);
//     console.log(`=====+======>${mockFind}`);

//     if (publisherId.publisherId === funds[0].publisherId) {
//         return {
//             populate: jest
//                 .fn()
//                 .mockImplementation(() => Promise.resolve(funds[0])),
//         };
//     }
//     return {
//         populate: jest
//             .fn()
//             .mockImplementation(() =>
//                 Promise.reject({ message: 'enter a valid query!' })
//             ),
//     };
// });

// describe('Get single fund test', () => {
//     // it('GET /funds/ should retrun the fund with the provided category', async () => {
//     //     const mockReq = {
//     //         query: {
//     //             category: 'No Poverty',
//     //         },
//     //     };
//     //     const mockRes = {
//     //         json: jest.fn(),
//     //     };
//     //     await getFunds(mockReq, mockRes);
//     //     // recived then expected
//     //     expect(mockFind).toHaveBeenCalledTimes(1);
//     //     expect(mockFind).toHaveBeenCalledWith(mockReq.query.category);
//     //     expect(mockRes.json).toHaveBeenCalledTimes(1);
//     //     expect(mockRes.json).toHaveBeenCalledWith(funds[0]);
//     // });
//     it('GET /funds/ should retrun the fund with the provided id', async () => {
//         const mockReq = {
//             query: {
//                 publisherId: '62e054bc598fb3f77c7e8af7 ',
//             },
//         };
//         const mockRes = {
//             json: jest.fn(),
//         };
//         await getFunds(mockReq, mockRes);
//         expect(mockFind).toHaveBeenCalledTimes(1);
//         expect(mockFind).toHaveBeenCalledWith({
//             publisherId: mockReq.query.publisherId,
//         });
//         expect(mockRes.json).toHaveBeenCalledTimes(1);
//         expect(mockRes.json).toHaveBeenCalledWith(funds[0]);
//     });
// });

// // jest.mock('../../models/fund');
// // fundModel.find = jest.fn().mockImplementation(() => funds);
// // describe('Fund controller', () => {
// //     it('should return all funds', async () => {
// //         const req = { query: {} };
// //         const res = {
// //             status: jest.fn(),
// //             json: jest.fn(),
// //         };
// //         await getFunds(req, res);

// //         expect(res.json).toHaveBeenCalledWith(funds);
// //         expect(fundModel.find).toHaveBeenCalled();
// //         expect(fundModel.find).toReturnWith(funds);
// //     });
// // });

// const request = require('supertest');
// const app = require('../../app');

// // jest.setTimeout(10000);

// const funds = [
//     {
//         _id: '62e054bc598fb3f77c7e8af6',
//         publisherId: '62e054bc598fb3f77c7e8af7',
//         category: ['No Poverty', 'Zero Hunger'],
//         content: 'lalalalalalalalala',
//     },
//     {
//         _id: '62bb828a6633820dbeccdc38',
//         publisherId: '62e054bc598fb3f77c7e8af9',
//         category: ['Quality Education', 'Zero Hunger'],
//         content: 'content1',
//     },
// ];

// beforeAll((done) => {
//     done();
// });

// afterAll((done) => {
//     done();
// });

// describe('Testing funds ', () => {
//     it('GET /api/events should retrieve all the post items', (done) => {
//         request(app)
//             .get('/funds')
//             .expect('Content-Type', /json/)
//             .expect(200, (err, res) => {
//                 if (err) {
//                     expect(res.statusCode).toBe(422);
//                     done();
//                     return err;
//                 }
//                 if (!res.query) {
//                     expect(res.statusCode).toBe(404);
//                     done();
//                     return res.json('No events found');
//                 }
//                 // expect(res.query).toBe(true);
//                 done();
//                 return funds;
//             });
//     });
// });
