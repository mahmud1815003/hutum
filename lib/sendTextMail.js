const { mailToken } = require('./mailTokens');

const sendTextMail = async (property) => {
    try {
        const { type, toMail, subject, emailBody } = property;
        const transporter = await mailToken(type);
        const emailAddress = type === 'server' ? `${process.env.fromServer}` : `${process.env.fromEmail}`;
        const emailFrom = type === 'server' ? `HUTUM Server` : `HUTUM`;
        const mailOptions = {
            from: `${emailFrom}🦉 <${emailAddress}>`,
            to: `${toMail}`,
            subject: `${subject}`,
            text: emailBody,
        }
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.log(error);
    }
}

const textMailProperty = (type, toMail, sub, body) => {
    return {
        type,
        toMail,
        subject: sub,
        emailBody: body,
    }
}

module.exports = {
    sendTextMail,
    textMailProperty,
}