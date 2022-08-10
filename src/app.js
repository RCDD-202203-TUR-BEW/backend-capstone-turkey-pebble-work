/* eslint-disable no-console */
const express = require('express');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { encryptCookieNodeMiddleware } = require('encrypt-cookie');
const connectToMongo = require('./db/connection');
const authRouter = require('./routes/auth');
const eventRouter = require('./routes/events');

const googleauth = require('./routes/google');
const fundsRouter = require('./routes/funds');
const { authMiddleware } = require('./middleware');
const { SWAGGER_OPTIONS } = require('./utility/variables');

const app = express();
const port = process.env.PORT;

app.use(cookieParser(process.env.SECRET_KEY));
app.use(encryptCookieNodeMiddleware(process.env.SECRET_KEY));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const swaggerSpec = swaggerJsdoc(SWAGGER_OPTIONS);
app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, { explorer: true })
);

app.use('/api/googleauth', googleauth);
app.use(authMiddleware);

app.use('/api/auth', authRouter);
app.use('/api/event', eventRouter);
app.use('/api/events', eventRouter);
app.use('/api/fund', fundsRouter);

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
