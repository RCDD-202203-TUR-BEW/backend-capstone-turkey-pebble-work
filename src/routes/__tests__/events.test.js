// const request = require('supertest');
// const moment = require('moment');
// const app = require('../../app');
// const Event = require('../../models/event');
// const connectToMongo = require('../../db/connection');

// describe('POST /EVENTS', () => {
//     beforeAll(async () => {
//         await connectToMongo();
//         const validUser = {
//             email: 'test@gmail.com',
//             password: '12345678',
//             firstName: 'Nur',
//             lastName: 'Sh',
//             dateOfBirth: '2000-01-01',
//             gender: 'male',
//             interests: ['No Poverty', 'Zero Hunger'],
//             preferredCities: ['Adana', 'Kocaeli'],
//         };
//         const res = await request(app)
//             .post('/api/auth/user/signup')
//             .field(validUser)
//             .attach('profileImage', './__tests__/test_image.jpg');
//         [jwtToken] = res.headers['set-cookie'][0].split(';');
//     });

//     describe('Post /event/:id/join to join voulnteers', () => {
//         it('Should reture 201 status when joined successfully', async () => {
//             const res = await request(app)
//                 .post(`/api/events`)
//                 .set('Content-Type', 'application/json')
//                 .set('Cookie', [jwtToken]);

//             const UpdatedDummyEvent = await Event.findOne({
//                 puplisherId: dummyUser.id,
//             });
//             expect(res.status).toBe(201);
//             expect(res.body.message).toBe('Joined Successfully');
//             expect(UpdatedDummyEvent.confirmedVolunteers[0].toString()).toBe(
//                 dummyUser.id
//             );
//         });
//     });
// });
