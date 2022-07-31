const request = require('supertest');

const app = require('../../app');
const { User, Organization, BaseUser, Token } = require('../../models/user');
const connectToMongo = require('../../db/connection');
const storage = require('../../db/storage');

const TEST_IMAGE_PATH = `${__dirname}/test_image.jpg`;
const PDF_PATH = `${__dirname}/invalid_image.pdf`;

beforeAll(async () => {
    // connect to test database
    await connectToMongo();
});

afterAll(async () => {
    // clean up database
    await BaseUser.deleteMany({});
    await Token.deleteMany({});
});

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

const validOrga = {
    email: 'test2@gmail.com',
    password: '12345678',
    description: 'Some description',
    name: 'Nur Orga',
    city: 'Adana',
    categories: ['No Poverty', 'Zero Hunger'],
    websiteUrl: 'www.nurorga.com',
};

let newUser = null;
let newToken = null;
let jwtToken = null;

// mocking the uploadImage function to avoid uploading images to the cloud while testing
const mockUploadImage = jest.spyOn(storage, 'uploadImage');
mockUploadImage.mockReturnValue(Promise.resolve('https://test.com/test.jpg'));

jest.setTimeout(30000);

describe('Sign up a new user', () => {
    it('POST /api/auth/user/signup should return a token in a cookie', (done) => {
        request(app)
            .post('/api/auth/user/signup')
            .field(validUser)
            .attach('profileImage', TEST_IMAGE_PATH)
            .expect('Content-Type', /json/)
            .expect(200, (err, res) => {
                if (err) return done(err);
                expect(res.headers['set-cookie']).toBeDefined();
                expect(res.headers['set-cookie']).toBeTruthy();
                expect(res.body.message).toBe(
                    'User successfully signed up and a verification email sent'
                );
                return done();
            });
    });

    it('POST /api/auth/user/signup should add a new user to the database', async () => {
        const user = await User.findOne({ email: validUser.email });
        expect(user).toBeDefined();
        expect(user.email).toBe(validUser.email);
        expect(user.hashedPassword).toBeDefined();
        expect(user.firstName).toBe(validUser.firstName);
        expect(user.lastName).toBe(validUser.lastName);
        expect(user.dateOfBirth).toBe(validUser.dateOfBirth);
        expect(user.interests).toEqual(validUser.interests);
        expect(user.preferredCities).toEqual(validUser.preferredCities);
        expect(user.profileImage).toBeDefined();
        expect(user.profileImage).toBeTruthy();
        expect(user.gender).toBe(validUser.gender);
    });

    it('POST /api/auth/user/signup should return an error when signing up with a used email', (done) => {
        request(app)
            .post('/api/auth/user/signup')
            .field(validUser)
            .attach('profileImage', TEST_IMAGE_PATH)
            .expect('Content-Type', /json/)
            .expect(400, (err, res) => {
                if (err) return done(err);
                expect(res.body.message).toBe('Email already used');
                return done();
            });
    });

    it('POST /api/auth/user/signup should add a new verifiation token to the database', async () => {
        newUser = await User.findOne({ email: validUser.email });
        newToken = await Token.findOne({ userId: newUser.id });
        expect(newToken).toBeDefined();
        expect(newToken.userId.toString()).toEqual(newUser.id);
        expect(newToken.token).toBeDefined();
    });

    it('POST /api/auth/user/signup should return an error when signing up with missing/invalid required fields', (done) => {
        const requiredFields = [
            'email',
            'password',
            'firstName',
            'lastName',
            'dateOfBirth',
            'gender',
        ];
        request(app)
            .post('/api/auth/user/signup')
            .field({})
            .expect('Content-Type', /json/)
            .expect(422, (err, res) => {
                if (err) return done(err);
                expect(res.body.errors).toBeDefined();
                requiredFields.forEach((field) => {
                    expect(
                        res.body.errors.find((error) => error.param === field)
                    ).toBeDefined();
                });
                return done();
            });
    });

    it('POST /api/auth/user/signup should return an error when signing up with invalid optional fields', (done) => {
        const optionalFields = ['profileImage', 'preferredCities', 'interests'];
        const invalidOpitionalFields = {
            preferredCities: ['Adana', 'Kocaeli', 'Some invalid city'],
            interests: ['No Poverty', 'Some invalid interest'],
        };
        request(app)
            .post('/api/auth/user/signup')
            .field(invalidOpitionalFields)
            .attach('profileImage', PDF_PATH)
            .expect('Content-Type', /json/)
            .expect(422, (err, res) => {
                if (err) return done(err);
                expect(res.body.errors).toBeDefined();
                optionalFields.forEach((field) => {
                    expect(
                        res.body.errors.find((error) => error.param === field)
                    ).toBeDefined();
                });
                return done();
            });
    });
});

describe('Sign up an organization', () => {
    it('POST /api/auth/organization/signup should return a token in a cookie', (done) => {
        request(app)
            .post('/api/auth/organization/signup')
            .field(validOrga)
            .attach('coverImage', TEST_IMAGE_PATH)
            .expect('Content-Type', /json/)
            .expect(200, (err, res) => {
                if (err) return done(err);
                expect(res.headers['set-cookie']).toBeDefined();
                expect(res.headers['set-cookie']).toBeTruthy();
                expect(res.body.message).toBe(
                    'User successfully signed up and a verification email sent'
                );
                [jwtToken] = res.headers['set-cookie'][0].split(';');
                return done();
            });
    });

    it('POST /api/auth/organization/signup should add a new organization to the database', async () => {
        const orga = await Organization.findOne({
            email: validOrga.email,
        });
        expect(orga).toBeDefined();
        expect(orga.email).toBe(validOrga.email);
        expect(orga.hashedPassword).toBeDefined();
        expect(orga.name).toBe(validOrga.name);
        expect(orga.description).toBe(validOrga.description);
        expect(orga.city).toBe(validOrga.city);
        expect(orga.categories).toEqual(validOrga.categories); // deep equality
        expect(orga.website).toBe(validOrga.website);
        expect(orga.coverImage).toBeDefined();
        expect(orga.coverImage).toBeTruthy();
    });

    it('POST /api/auth/organization/signup should return an error when signing up with a used email', (done) => {
        request(app)
            .post('/api/auth/organization/signup')
            .field(validOrga)
            .attach('coverImage', TEST_IMAGE_PATH)
            .expect('Content-Type', /json/)
            .expect(400, (err, res) => {
                if (err) return done(err);
                expect(res.body.message).toBe('Email already used');
                return done();
            });
    });

    it('POST /api/auth/organization/signup should add a new verifiation token to the database', async () => {
        const orga = await Organization.findOne({ email: validOrga.email });
        const token = await Token.findOne({ userId: orga.id });
        expect(token).toBeDefined();
        expect(token.userId.toString()).toEqual(orga.id);
        expect(token.token).toBeDefined();
    });

    it('POST /api/auth/organization/signup should return an error when signing up with missing/invalid required fields', (done) => {
        const requiredFields = [
            'email',
            'password',
            'name',
            'description',
            'city',
        ];
        request(app)
            .post('/api/auth/organization/signup')
            .field({})
            .expect('Content-Type', /json/)
            .expect(422, (err, res) => {
                if (err) return done(err);
                expect(res.body.errors).toBeDefined();
                requiredFields.forEach((field) => {
                    expect(
                        res.body.errors.find((error) => error.param === field)
                    ).toBeDefined();
                });
                return done();
            });
    });

    it('POST /api/auth/organization/signup should return an error when signing up with invalid optional fields', (done) => {
        const optionalFields = ['coverImage', 'categories', 'websiteUrl'];
        const invalidOpitionalFields = {
            categories: ['No Poverty', 'Some invalid category'],
            // website must be a string not an array
            websiteUrl: ['https://www.google.com', 'Some invalid website'],
        };

        request(app)
            .post('/api/auth/organization/signup')
            .field(invalidOpitionalFields)
            .attach('coverImage', PDF_PATH)
            .expect('Content-Type', /json/)
            .expect(422, (err, res) => {
                if (err) return done(err);
                expect(res.body.errors).toBeDefined();
                optionalFields.forEach((field) => {
                    expect(
                        res.body.errors.find((error) => error.param === field)
                    ).toBeDefined();
                });
                return done();
            });
    });
});

describe('Sign in a user/organization', () => {
    it('POST /api/auth/signin should return a token in a cookie and user not verified warning', (done) => {
        request(app)
            .post('/api/auth/signin')
            .set('Content-Type', 'application/json')
            .send({
                email: validUser.email,
                password: validUser.password,
            })
            .expect('Content-Type', /json/)
            .expect(200, (err, res) => {
                if (err) return done(err);
                expect(res.headers['set-cookie']).toBeDefined();
                expect(res.headers['set-cookie']).toBeTruthy();
                expect(res.body.message).toBe('User signed in');
                expect(res.body.warning).toBe('User not verified');
                return done();
            });
    });

    it('POST /api/auth/signin should return an if passed invalid email', (done) => {
        request(app)
            .post('/api/auth/signin')
            .set('Content-Type', 'application/json')
            .send({
                email: 'invalid@invalid.invalid',
                password: validUser.password,
            })
            .expect('Content-Type', /json/)
            .expect(400, (err, res) => {
                if (err) return done(err);
                expect(res.body.message).toBe('Invalid email or password');
                return done();
            });
    });

    it('POST /api/auth/signin should return an error if passed invalid password', (done) => {
        request(app)
            .post('/api/auth/signin')
            .set('Content-Type', 'application/json')
            .send({
                email: validUser.email,
                password: 'invalid password',
            })
            .expect('Content-Type', /json/)
            .expect(400, (err, res) => {
                if (err) return done(err);
                expect(res.body.message).toBe('Invalid email or password');
                return done();
            });
    });

    it('POST /api/auth/organization/signup should return an error when signing in with missing required fields', (done) => {
        const requiredFields = ['email', 'password'];
        request(app)
            .post('/api/auth/signin')
            .set('Content-Type', 'application/json')
            .send({})
            .expect('Content-Type', /json/)
            .expect(422, (err, res) => {
                if (err) return done(err);
                expect(res.body.errors).toBeDefined();
                requiredFields.forEach((field) => {
                    expect(
                        res.body.errors.find((error) => error.param === field)
                    ).toBeDefined();
                });
                return done();
            });
    });
});

describe('Verify user', () => {
    it('GET /api/auth/verify/:id/:token should return an error if passed invalid id', (done) => {
        const invalidId = '123';
        const randomToken = '123';
        request(app)
            .get(`/api/auth/verify/${invalidId}/${randomToken}`)
            .set('Content-Type', 'application/json')
            .expect('Content-Type', /json/)
            .expect(422, (err, res) => {
                if (err) return done(err);
                expect(res.body.errors).toBeDefined();
                expect(res.body.errors[0].param).toBe('id');
                expect(res.body.errors[0].msg).toBe('A valid id is required');
                return done();
            });
    });

    it('GET /api/auth/verify/:id/:token should return an error if passed valid but wrong id', (done) => {
        const validButWrongId = '62e2738e99c12c5a84ceb43f';
        const randomToken = '123';
        request(app)
            .get(`/api/auth/verify/${validButWrongId}/${randomToken}`)
            .set('Content-Type', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400, (err, res) => {
                if (err) return done(err);
                expect(res.body.message).toBe('Invalid link');
                return done();
            });
    });

    it('GET /api/auth/verify/:id/:token should return an error if passed valid id but wrong token', (done) => {
        BaseUser.findOne({ email: validUser.email }).then((user) => {
            const randomToken = '123';
            request(app)
                .get(`/api/auth/verify/${user.id}/${randomToken}`)
                .set('Content-Type', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, (err, res) => {
                    if (err) return done(err);
                    expect(res.body.message).toBe('Invalid link');
                    return done();
                });
        });
    });

    it('GET /api/auth/verify/:id/:token should verify the signed up user', (done) => {
        request(app)
            .get(`/api/auth/verify/${newUser.id}/${newToken.token}`)
            .set('Content-Type', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200, (err, res) => {
                if (err) return done(err);
                expect(res.body.message).toBe('User verified');
                return done();
            });
    });

    it('GET /api/auth/verify/:id/:token should return an error if user already verified', (done) => {
        request(app)
            .get(`/api/auth/verify/${newUser.id}/${newToken.token}`)
            .set('Content-Type', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400, (err, res) => {
                if (err) return done(err);
                expect(res.body.message).toBe('User already verified');
                return done();
            });
    });
});

describe('Sign out user', () => {
    it('GET /api/auth/signout should return an error if user is not signed in', (done) => {
        request(app)
            .post('/api/auth/signout')
            .set('Content-Type', 'application/json')
            .expect('Content-Type', /json/)
            .expect(401, (err, res) => {
                if (err) return done(err);
                expect(res.body.error).toBe(true);
                expect(res.body.message).toBe(
                    'Invalid Token: No authorization token was found'
                );
                return done();
            });
    });

    it('GET /api/auth/signout should sign user out', (done) => {
        request(app)
            .get('/api/auth/signout')
            .set('Content-Type', 'application/json')
            .set('Cookie', [jwtToken])
            .expect('Content-Type', /json/)
            .expect(200, (err, res) => {
                if (err) return done(err);
                expect(res.headers['set-cookie']).toBeDefined();
                expect(res.headers['set-cookie']).toBeTruthy();
                expect(res.body.message).toBe('User signed out');
                return done();
            });
    });
});
