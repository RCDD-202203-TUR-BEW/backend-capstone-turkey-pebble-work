const { expressjwt: jwt } = require('express-jwt');
const mongoose = require('mongoose');

const publicRoutes = [
    '/api/google-auth/google',
    '/api/auth/user/signup',
    '/api/auth/organization/signup',
    '/api/auth/signin',
    '/api/auth/image',
    // we can't use /api/auth/verify/:id/:token directly
    // this is a regex, so it will match any path similar to /api/auth/verify/324/123456789
    // https://forbeslindesay.github.io/express-route-tester/
    /^\/api\/auth\/verify\/(?:([^/]+?))\/(?:([^/]+?))\/?$/i,
    { url: /^\/api\/fund\/(?:([^/]+?))\/?$/i, methods: ['GET'] },
    { url: '/api/event/', methods: ['GET'] },
    { url: '/api/fund/', methods: ['GET'] },
    { url: /^\/api\/event\/(?:([^/]+?))\/?$/i, methods: ['GET'] },
    { url: /^\/api\/fund\/(?:([^/]+?))\/donate\/?$/i, methods: ['POST'] },
];

const authMiddleware = jwt({
    secret: process.env.SECRET_KEY,
    algorithms: ['HS256'],
    getToken: (req) => req.signedCookies.auth_token ?? req.cookies.auth_token,
    requestProperty: 'user',
}).unless({
    path: publicRoutes,
});

function autherizationMiddleware(model) {
    return async (req, res, next) => {
        const obj = await model.findOne({
            publisherId: mongoose.Types.ObjectId(req.user.id),
            _id: mongoose.Types.ObjectId(req.params.id),
        });
        if (!obj) {
            return res.sendStatus(403);
        }
        return next();
    };
}

module.exports = {
    authMiddleware,
    autherizationMiddleware,
};
