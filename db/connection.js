const mongoose = require('mongoose');

const { MONGODB_URI } = process.env.MONGODB_URI;

const connectToMongo = () => {
  mongoose
    .connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log(`MongoDB Connected…`);
    })
    .catch((err) => console.log('Database connection error: ', err));
};

module.exports = connectToMongo;
