const mongoose = require('mongoose');

const urlDev = process.env.MONGODB_URI_dev;
const urlTest = process.env.MONGODB_URI_test;
const urlProd = process.env.MONGODB_URI_prod;

let url = urlDev;
if (process.env.NODE_ENV === 'test') url = urlTest;
if (process.env.NODE_ENV === 'production') url = urlProd;

const connectToMongo = () => {
  console.log(process.env.NODE_ENV);
  mongoose
    .connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log(`MongoDB Connected…`);
    })
    .catch((err) => console.log('Database connection error: ', err));
};

module.exports = connectToMongo;
