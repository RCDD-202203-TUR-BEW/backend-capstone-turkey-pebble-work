const express = require('express');
require('dotenv').config();
const cookieParser = require('cookie-parser');

const { encryptCookieNodeMiddleware } = require('encrypt-cookie');
const connectToMongo = require('./db/connection');
const authRouter = require('./routes/auth');
const { authMiddleware } = require('./middleware');

const app = express();
const port = process.env.PORT;

app.use(cookieParser(process.env.SECRET_KEY));
app.use(encryptCookieNodeMiddleware(process.env.SECRET_KEY));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(authMiddleware);

app.use('/api/auth', authRouter);

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
