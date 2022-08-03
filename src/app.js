const express = require('express');
require('dotenv').config();
const cookieParser = require('cookie-parser');

const { encryptCookieNodeMiddleware } = require('encrypt-cookie');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const connectToMongo = require('./db/connection');
const authRouter = require('./routes/auth');
const eventRouter = require('./routes/events');
const { authMiddleware } = require('./middleware');
const { connectToStorage } = require('./db/storage');

const app = express();
const port = process.env.PORT;

app.use(cookieParser(process.env.SECRET_KEY));
app.use(encryptCookieNodeMiddleware(process.env.SECRET_KEY));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Pebble_Work Project Express API with Swagger',
            version: '0.1.0',
            description:
                'This is a simple API application made with Express and documented with Swagger',
            license: {
                name: 'MIT',
                url: 'https://spdx.org/licenses/MIT.html',
            },
        },
        servers: [
            {
                url: process.env.BASE_URL,
            },
        ],
    },
    apis: ['./src/docs/**/*.yaml'],
};
const specs = swaggerJsdoc(options);
app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(specs, { explorer: true })
);
app.use(authMiddleware);

app.use('/api/auth', authRouter);
app.use('/api/event', eventRouter);

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
