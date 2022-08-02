const express = require('express');
require('dotenv').config();
const bodyParser = require('body-parser');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const connectToMongo = require('./db/connection');
// const swaggerDoc = require('./swagger.json');
const fundsRoutes = require('./routes/funds');

const app = express();
const port = process.env.PORT;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use('/api/funds', fundsRoutes);
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'PebbleWork API documentation with Swagger',
            version: '0.1.0',
            description: 'This is a API application made with Express',
            license: {
                name: 'MIT',
                url: 'https://spdx.org/licenses/MIT.html',
            },
            contact: {
                name: 'PebbleWork',
                url: 'https://github.com/RCDD-202203-TUR-BEW/backend-capstone-turkey-pebble-work',
            },
        },
        servers: [
            {
                url: process.env.BASE_URL,
            },
        ],
        host: process.env.BASE_URL,
    },
    apis: ['./src/docs/*/.yaml'],
};

const specs = swaggerJsdoc(options);
app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(specs, { explorer: true })
);

/**
 * @swagger
 * /:
 *   get:
 *     description:  Endpoint for everything
 */
app.get('/', (req, res) => {
    res.json({ message: 'everything!' });
});
if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
        // TODO replace this with a logger
        // console.log(`Server listening on port ${port}`);
        connectToMongo();
    });
}

module.exports = app;
