const express = require('express');
require('dotenv').config();

const connectToMongo = require('./db/connection');

const fundsRoutes = require('./routes/funds');

const app = express();
const port = process.env.PORT;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use('/funds', fundsRoutes);

app.get('/', (req, res) => {
    // console.log('Here');
    res.end();
});

if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
        // TODO replace this with a logger
        // console.log(`Server listening on port ${port}`);
        connectToMongo();
    });
}

module.exports = app;
