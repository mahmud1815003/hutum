//External Imports
const axios = require('axios');

//Internal Imports
const Emails = require('../models/email');
const { kuetMail } = require('../lib/kuetMail');
const { sendTextMail, textMailProperty } = require('../lib/sendTextMail');

const addNewMail = async (req, res, next) => {
    try {
        const { uniqueString } = req.params;
        const user = await Emails.findOne({ isVerified: uniqueString });
        if (user) {
            user.isVerified = 'ok';
            const x = await user.save();
            if (user.institution === 'KUET') {
                const kuet = kuetMail(user.email);
                const data = {
                    'email': user.email,
                    'roll': kuet.roll,
                    'department': kuet.department,
                    'year': parseInt(kuet.roll.slice(0, 2)) + 2000,
                    'isVerified': 'ok',
                    'flag': '',
                    'alternate': ''
                }
                console.log(data);
                const mailBody = `Hello ${kuet.name},\nYour KUET Mail has been added to our Server. Now you can use our Movie/Book request Service. And your KUET mail will be added to our Academic Database within 8 Hours. Then you will be able to access the academic materials of HUTUM. Have a nice day.\n\n--Team Hutum`;
                const sub = `Follow Up from Hutum`;
                const property = textMailProperty('server', `${user.email}`, sub, mailBody);
                await sendTextMail(property);

                const message = `------NEW KUET MAIL------\n\nName: ${kuet.name}\nRoll: ${kuet.roll}\nDept: ${kuet.department}\n\nEmail: ${user.email}\n\nPlease add this Email to HUTUM Email group to give access to Academic Materials of HUTUM`;
                await axios.get(`https://api.telegram.org/bot${process.env.telapi}/sendMessage?chat_id=${process.env.chatId}&text=${message}`);
                await axios.post(`${process.env.emailSheetsofKUET}`, data);
                res.render('emailVerification', {
                    header: "Welcome to HUTUM 101 !!!",
                    body: `Your ${user.email} email has been varified succesfully. Please check your email for further query.`
                });
            } else {
                const data = {
                    'email': user.email,
                    'institution': user.institution,
                    'isVerified': 'ok',
                    'flag': ''
                }
                const sub = `Follow Up from Hutum`;
                const mailBody = `Hello, Someone From ${user.institution}\nYour Varsity Mail has been added to our Server. Now you can use our Movie/Book request Service. Have a nice day.\n\n--Team Hutum`;
                const property = textMailProperty('server', `${user.email}`, sub, mailBody);
                await sendTextMail(property);
                await transport.sendMail(mailOptions);
                await axios.post(`${process.env.emailSheetsofOthers}`, data);
                res.render('emailVerification', {
                    header: "Welcome to HUTUM 101 !!!",
                    body: `Your ${user.email} email has been varified succesfully. Please check your email for further query.`
                });
            }
        } else {
            res.render('emailVerification', {
                header: "Oppss !!!",
                body: `Invalid Verification Link.`,
            });
            // res.send('Invalid Verification Link\n--Team Hutum');
        }
    } catch (error) {
        console.log('Server Error in SpreadSheet Writing ', error);
        // res.send('Server Side Error\n--Team Hutum');
        res.render('emailVerification', {
            header: "Oppss !!!",
            body: `Your ${user.email} email has not been varified due to server side error. Please try again letter`
        });
    }
}

module.exports = {
    addNewMail,
}