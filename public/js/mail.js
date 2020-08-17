const nodemailer = require('nodemailer');
const mailGun = require('nodemailer-mailgun-transport');

const auth = {
    auth: {
        api_key: 'key-2230f80686329b7302cc6bd392182e1c\n', //private key
        domain: 'sandbox2dda134603304d5583eaf071d8a15ba6.mailgun.org'
    }
};

const transporter = nodemailer.createTransport(mailGun(auth));

const sendMail = (name, email, subject, message, cb) => {
    const mailOptions = {
        from: email, //works - email sho its from
        to: 'henry.shelton@outlook.com', //works - comes to me
        name: name,
        //phone: phone,
        subject: subject,
        text: message
    };

    transporter.sendMail(mailOptions, function(err, data) {
        if (err) {
            cb(err, null);
        } else {
            cb(null, data);
        }

    });
};

module.exports = sendMail;