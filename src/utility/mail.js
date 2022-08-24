const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'Outlook365',
    secure: true,
    auth: {
        user: process.env.OUTLOOK_EMAIL,
        pass: process.env.OUTLOOK_PASSWORD,
    },
});

async function sendEmail(email, subject, text) {
    const mailOptions = {
        from: process.env.OUTLOOK_EMAIL,
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
