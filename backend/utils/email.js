const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

let transporter;

const setupTransporter = async () => {
    if (transporter) return transporter;

    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT || 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
        console.log('Using configured SMTP settings');
        transporter = nodemailer.createTransport({
            host,
            port,
            secure: Number(port) === 465,
            auth: { user, pass }
        });
    } else {
        console.log('No SMTP config found. Creating an Ethereal test account...');
        try {
            const testAccount = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass
                }
            });
            console.log(`Ethereal test account created. User: ${testAccount.user}`);
        } catch (err) {
            console.error('Failed to create Ethereal account, using mock logger:', err.message);
            transporter = {
                sendMail: async (mailOptions) => {
                    const logMsg = `
========================================
MOCK EMAIL SENT AT: ${new Date().toISOString()}
To: ${mailOptions.to}
Subject: ${mailOptions.subject}
Body:
${mailOptions.text || mailOptions.html}
========================================
`;
                    console.log(logMsg);
                    const logPath = path.join(__dirname, '../email-debug.log');
                    fs.appendFileSync(logPath, logMsg);
                    return { messageId: 'mock-id-' + Date.now() };
                }
            };
        }
    }
    return transporter;
};

const sendEmail = async ({ to, subject, text, html }) => {
    try {
        const mailTransporter = await setupTransporter();
        const info = await mailTransporter.sendMail({
            from: process.env.FROM_EMAIL || '"Campus Event Engine" <no-reply@campus.edu>',
            to,
            subject,
            text,
            html
        });
        console.log(`Email sent to ${to}: ${info.messageId}`);
        if (info.messageId && info.messageId.indexOf('mock-id-') === -1 && transporter.options && transporter.options.host === 'smtp.ethereal.email') {
            console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
        }
        return info;
    } catch (err) {
        console.error(`Failed to send email to ${to}:`, err.message);
    }
};

module.exports = { sendEmail };
