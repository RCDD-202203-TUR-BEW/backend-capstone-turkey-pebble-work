const mongoose = require('mongoose');

const url = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@pebble-work-capstone.umzdwjg.mongodb.net/${process.env.NODE_ENV}?retryWrites=true&w=majority`;

const connectToMongo = () => {
    mongoose
        .connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        .then(() => {
            // TODO: replace this with a logger
            // console.log(`MongoDB Connected…`);
        })
        .catch((err) => {
            // TODO: replace this with a logger
            // console.log('Database connection error: ', err);
        });
};
module.exports = connectToMongo;
