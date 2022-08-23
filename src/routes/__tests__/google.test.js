/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable node/no-extraneous-require */
/* eslint-disable no-continue */
/* eslint-disable consistent-return */
/* eslint-disable no-shadow */
/* eslint-disable global-require */
/* eslint-disable no-return-await */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-console */
/* eslint-disable no-param-reassign */
/* eslint-disable no-use-before-define */
/* eslint-disable camelcase */
/* eslint-disable node/no-unsupported-features/node-builtins */
/* eslint-disable no-unused-expressions */
const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../../app');
const db = require('../../db/connection');

const req = supertest(app);

beforeAll(async () => {
    await db();
});

afterAll(async (drop = false) => {
    drop && (await mongoose.connection.dropDatabase());
    await mongoose.disconnect();
    await mongoose.connection.close();
});

let redirectUri = null;

describe('Google Auth Endpoints', () => {
    describe('GET /api/googleauth/google', () => {
        it('Redirects to google authorization page', (done) => {
            req.get('/api/googleauth/google')
                .expect(302)
                .expect('location', /google\.com/)
                .end(done);
        });

        it('Redirects with correct scope and credentials', async () => {
            const res = await req.get('/api/auth/google');
            const { location } = res.header;

            expect(location).not.toBeNull();

            const uri = new URL(location);
            const scope = uri.searchParams.get('scope')?.split(' ') ?? [];
            const redirectTo = uri.searchParams.get('redirect_uri') ?? '';
            const client_id = uri.searchParams.get('client_id') ?? '';

            expect(scope).toEqual(
                expect.arrayContaining(['openid', 'email', 'profile'])
            );
            expect(client_id.length).toBeGreaterThan(10);

            if (redirectTo) redirectUri = new URL(redirectTo);
        });
    });

    describe(`GET REDIRECT_URI`, () => {
        it('Redirects to google sign in page without cookie for incorrect credentials', async () => {
            expect(redirectUri).not.toBeNull();
            const res = await req.get(redirectUri.pathname);
            expect(res.status).toBe(302);
            expect(res.header['set-cookie']).not.toBeDefined();
        });
    });
});
