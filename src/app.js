/* eslint-disable no-unused-vars */
const express = require('express');
require('dotenv').config();
const passport = require('passport');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { encryptCookieNodeMiddleware } = require('encrypt-cookie');
const connectToMongo = require('./db/connection');
const authRouter = require('./routes/auth');
const fundRouter = require('./routes/funds');

const googleauth = require('./routes/google');
const twitterAuth = require('./routes/twitter');
const { authMiddleware } = require('./middleware');
const { SWAGGER_OPTIONS } = require('./utility/variables');
const eventsRouter = require('./routes/events');
const userRouter = require('./routes/users');
const organizationRouter = require('./routes/organizations');

const app = express();
const port = process.env.PORT;

const whitelist = ['http://localhost:3000'];
const corsOptions = {
    credentials: true,
    origin(origin, callback) {
        // allow requests with no origin like browser requests to /api-docs
        if (!origin) return callback(null, true);
        if (whitelist.indexOf(origin) !== -1) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    },
};

app.use(cors(corsOptions));

app.use(cookieParser(process.env.SECRET_KEY));
app.use(encryptCookieNodeMiddleware(process.env.SECRET_KEY));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(
    session({
        secret: process.env.SECRET_KEY,
        resave: false,
        saveUninitialized: false,
        cookie: {},
    })
);

app.use(passport.initialize());
app.use(passport.session());
const swaggerSpec = swaggerJsdoc(SWAGGER_OPTIONS);
app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, { explorer: true })
);
app.use('/api/google-auth', googleauth);
app.use('/api/twitter-auth', twitterAuth);
app.use(authMiddleware);

app.use('/api/fund', fundRouter);
app.use('/api/auth', authRouter);
app.use('/api/event', eventsRouter);
app.use('/api/user', userRouter);
app.use('/api/organization', organizationRouter);

function ErrorHandler(err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({
            error: true,
            message: `Invalid Token: ${err.message}`,
        });
    } else {
        console.log(err);
        res.status(500).json({
            error: true,
            message: 'Internal server error occured',
        });
    }
}

app.use(ErrorHandler);

if (process.env.NODE_ENV !== 'test') {
    app.listen(port, async () => {
        console.log(`Server listening on port ${port}`);
        await connectToMongo();
    });
}

module.exports = app;
