const { expressjwt: jwt } = require('express-jwt');

const publicRoutes = [
    '/api/auth/google',
    '/api/auth/user/signup',
    '/api/auth/organization/signup',
    '/api/auth/signin',
    '/api/auth/image',
    // we can't use /api/auth/verify/:id/:token directly
    // this is a regex, so it will match any path similar to /api/auth/verify/324/123456789
    /^\/api\/auth\/verify\/(?:([^/]+?))\/(?:([^/]+?))\/?$/i,
    { url: '/api/event/', methods: ['GET'] },
];

const authMiddleware = jwt({
    secret: process.env.SECRET_KEY,
    algorithms: ['HS256'],
    getToken: (req) => req.signedCookies.auth_token ?? req.cookies.auth_token,
    requestProperty: 'user',
}).unless({
    path: publicRoutes,
});

module.exports = {
    authMiddleware,
};
