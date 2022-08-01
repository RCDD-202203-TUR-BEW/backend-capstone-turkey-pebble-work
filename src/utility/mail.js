const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    secure: true,
    auth: {
        type: 'OAuth2',
        user: process.env.EMAIL,
        pass: process.env.EAMIL_PASSWORD,
        clientId: process.env.OAUTH2_CLIENT_ID,
        clientSecret: process.env.OAUTH2_CLIENT_SECRET,
        refreshToken: process.env.OAUTH2_REFRESH_TOKEN,
        accessToken: process.env.OAUTH2_ACCESS_TOKEN,
    },
});

async function sendEmail(email, subject, text) {
    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject,
        text,
    };
    try {
        await transporter.sendMail(mailOptions);
    } catch (err) {
        console.log('Email not sent');
        console.log(err);
    }
}

module.exports = {
    sendEmail,
};
