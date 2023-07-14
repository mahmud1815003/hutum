const { mailToken } = require('./mailTokens');
const hbs = require('nodemailer-express-handlebars');
const path = require('path');
const moment = require('moment');



const sendMail = async (property) => {
    try {
        const {type, toMail, subject, header, emailBody, emailFooter} = property;
        const transporter = await mailToken('server');
        const handlebarOptions = {
            viewEngine: {
                partialsDir: path.resolve('./lib'),
                defaultLayout: false,
            },
            viewPath: path.resolve('./lib/'),
        };
        const emailAddress = type === 'server' ? `${process.env.fromServer}` : `${process.env.fromEmail}`;
        const emailFrom = type === 'server' ? `HUTUM Server` : `HUTUM`;
        transporter.use('compile', hbs(handlebarOptions))
        const mailOptions = {
            from: `${emailFrom}🦉 <${emailAddress}>`,
            to: `${toMail}`,
            subject: `${subject}`,
            template: 'email', // the name of the template file i.e email.handlebars
            context: {
                name: `${header}`,// replace {{company}} with My Company
                body: `${emailBody}`,
                year: moment(new Date()).utcOffset(6).format('yyyy'),
                footer: `${emailFooter}`
            }
        }

        const result = await transporter.sendMail(mailOptions);
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
  sendMail
}

// sendMail({
//     type: 'server',
//     toMail: 'mahmud1815003@stud.kuet.ac.bd',
//     subject: 'Server Testing',
//     header: 'Dear Niloy',
//     emailBody: 'We have got your request for movies/series. Your requested movies/series will be available on our drive within 48 hours. Till then you can enjoy our other movies/series.',
//     emailFooter: 'Thanks for using our movie request service. In this pandemic, stay home and safe.',

// });
