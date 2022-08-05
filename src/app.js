const express = require('express');
require('dotenv').config();
const bodyParser = require('body-parser');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const connectToMongo = require('./db/connection');
const fundsRoutes = require('./routes/funds');
const variables = require('../utility/variables');

const app = express();
const port = process.env.PORT;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use('/api/funds', fundsRoutes);

const specs = swaggerJsdoc(variables.SWAGGER_OPTIONS);
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
        console.log(`Server listening on port ${port}`);
        connectToMongo();
    });
}

module.exports = app;
