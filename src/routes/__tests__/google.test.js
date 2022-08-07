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
const http = require('node:http');
const https = require('node:https');
const monkeypatch = require('monkeypatch');
const supertest = require('supertest');
const app = require('../../app');

const req = supertest(app);
const db = require('../../db/connection');
const UserModel = require('../../models/user');

const mockUser = {
    sub: '12345678',
    name: 'not nilay aydin',
    given_name: 'not Nilay',
    family_name: 'not Aydin',
    picture: 'https://lh3.googleusercontent.com/a-/AOh1',
    email: 'absolutlynotnilay.aydin@gmail.com',
    email_verified: true,
    locale: 'en-GB',
};

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
    const cookiesAgent = supertest.agent(app);

    describe('GET /api/auth/google', () => {
        it('Redirects to google authorization page', (done) => {
            req.get('/api/auth/google')
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

async function runInPatchedServer(cb) {
    const undo = patch__google_request({
        [`http://127.0.0.1/token`]: (path) => path.endsWith('token'),
        [`http://127.0.0.1/userinfo`]: (path) => path.endsWith('userinfo'),
    });

    const shutdownServer = runTestServer();

    const ret = await cb();

    shutdownServer();
    undo();

    return ret;
}

function patch__google_request(redirects, debug = false) {
    monkeypatch(https, 'request', (orig, opts, cb) => {
        const { host, path } = opts;

        if (/google[a-z0-9]*\.com/.test(host)) {
            if (debug)
                console.log(
                    'Intercepted google call to: ',
                    opts.method ?? 'GET',
                    opts.host,
                    opts.path
                );

            for (let url of Object.keys(redirects)) {
                const matcher = redirects[url];
                url = new URL(url);
                if (matcher(path.split('?')[0])) {
                    if (debug)
                        console.log('Redirecting to test server: ', url.href);
                    opts.host = url.host;
                    opts.port = 5005;
                    opts.path = url.pathname;
                    opts.headers.Host = url.origin;

                    return http.request(opts, cb);
                }
            }
        }
        return orig(opts, cb);
    });

    return () => {
        https.request.unpatch();
    };
}

function getLoginURL(base) {
    const params = Object.entries({
        code: 'TEST_CODE',
        scope: 'email profile openid',
    }).reduce((a, p) => {
        a.append(...p);
        return a;
    }, new URLSearchParams());

    return `${base}?${params.toString()}`;
}

// This is a testing server that
// serves google identical profile and tokens
function runTestServer() {
    const app = require('express')();
    const token = {
        access_token: 'TEST_ACCESS_TOKEN',
    };

    app.get('/token', (req, res) => {
        res.json(token);
    });

    app.post('/token', (req, res) => {
        res.json(token);
    });

    app.get('/userinfo', (req, res) => {
        res.json(mockUser);
    });

    const server = app.listen(5005, () => {});

    return async () => await server.close();
}

// receives cookies object {name: value}
function getJWTCookie(cookies) {
    const entries = Object.entries(cookies);

    for (let [, value] of entries) {
        try {
            value = parseJWTCookie(value);
            return value;
        } catch (err) {
            continue;
        }
    }
}
function parseJWTCookie(value) {
    if (typeof value !== 'string') {
        return undefined;
    }
    const { SECRET_KEY } = process.env;

    const { decryptAesGcm } = require('encrypt-cookie');
    const jwt = require('jsonwebtoken');
    value = decryptAesGcm(value, SECRET_KEY) || value;

    if (value.substr(0, 2) === 's:') {
        // Unsign cookie
        const { unsign } = require('cookie-signature');
        value = unsign(value, SECRET_KEY);
    }

    const decoded = jwt.verify(value, SECRET_KEY);
    return decoded;
}

// parses set-cookie array
function parseCookies(cookies) {
    const parser = require('cookie');
    const obj = {};
    cookies.forEach((c) => {
        try {
            c = parser.parse(c.split(/; */)[0]);
            Object.assign(obj, c);
        } catch (err) {
            console.log(err);
        }
    });
    return [
        obj,
        Object.entries(obj)
            .map((e) => parser.serialize(...e))
            .join('; '),
    ];
}
