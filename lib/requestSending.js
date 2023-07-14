//External Imports
const axios = require('axios');
const moment = require('moment');

//Internal Imports
const Requests = require('../models/request');
const RequestsCount = require('../models/requestCount');
const { sendTextMail, textMailProperty } = require('../lib/sendTextMail');
const { emailValidator } = require('./emailValidator');
const { kuetMail } = require('./kuetMail');
const { sendMail } = require('./sendMail');


const getRequests = async () => {
    try {
        const request = await Requests.find({});
        let movieCounter = 0;
        let bookCounter = 0;
        for (let data of request) {
            if (data.movie != '') {
                //Serving Movie Request
                movieCounter++;
                const email = emailValidator(data.email);
                if (email.institution === 'KUET') {
                    //For KUET mails only
                    const kuetmail = kuetMail(data.email);

                    //User Mail for movies
                    sendMail({
                        type: `server`,
                        toMail: `${data.email}`,
                        subject: `HUTUM Movie/Series Request Service`,
                        header: `Dear ${kuetmail.name}`,
                        emailBody: `We have got your request for movies/series. If your requested movies/series are already on our database or it's a junk request, we will not reply anything. Otherwise, an admin will let you know after we uploaded your movies/series`,
                        emailFooter: `Thanks for using our requesting service. We appreciate your love and support. Have a nice day.`

                    });

                    //Admin Mail for movies
                    const sub = `New Movie Request`;
                    const mailBody = `Name: ${kuetmail.name}\nDept: ${kuetmail.department}\nEmail: ${data.email}\nMovie: ${data.movie}\nSeries: ${data.series}\n\n`;
                    const property = textMailProperty('server', `${process.env.fromEmail}`, sub, mailBody);
                    await sendTextMail(property);

                    //Admin Telegram Group for movies
                    const message = `------New Movie Request------\n\nName: ${kuetmail.name}\nDept: ${kuetmail.department}\nEmail: ${data.email}\n\nMovies:\n${encodeURI(data.movie)}\n\nSeries:\n${encodeURI(data.series)}\n`
                    await axios.get(`https://api.telegram.org/bot${process.env.telapi}/sendMessage?chat_id=${process.env.chatId}&text=${message}`);
                } else {
                    //For other institutes mails
                    const mail = emailValidator(data.email);

                    //User Mail for movies
                    sendMail({
                        type: `server`,
                        toMail: `${data.email}`,
                        subject: `HUTUM Movie/Series Request Service`,
                        header: `Someone From ${mail.institution}`,
                        emailBody: `We have got your request for movies/series. If your requested movies/series are already on our database or it's a junk request, we will not reply anything. Otherwise, an admin will let you know after we uploaded your movies/series`,
                        emailFooter: `Thanks for using our requesting service. We appreciate your love and support. Have a nice day.`

                    });
                    //Admin Mail for movies
                    const sub = `New Movie Request`;
                    const mailBody = `Name: Someone from ${mail.institution}\nEmail: ${data.email}\nMovie: ${data.movie}\nSeries: ${data.seires}\n\n`;
                    const property = textMailProperty('server', `${process.env.fromEmail}`, sub, mailBody);
                    await sendTextMail(property);

                    //Admin Telegram Group for movies
                    const message = `------New Movie Request------\n\nName: Someone From ${mail.institution}\nEmail: ${data.email}\n\nMovies:\n${encodeURI(data.movie)}\n\nSeries:\n${encodeURI(data.series)}\n`
                    await axios.get(`https://api.telegram.org/bot${process.env.telapi}/sendMessage?chat_id=${process.env.chatId}&text=${message}`);
                }
            } else {
                //For Books Request
                bookCounter++;
                const email = emailValidator(data.email);
                if (email.institution === 'KUET') {
                    //For KUET mails only
                    const kuetmail = kuetMail(data.email);
                    sendMail({
                        type: `server`,
                        toMail: `${data.email}`,
                        subject: `HUTUM Books Request Service`,
                        header: `Dear ${kuetmail.name}`,
                        emailBody: `We have got your request for Books. If your requested Books are already on our database or it's a junk request, we will not reply anything. Otherwise, an admin will let you know after we uploaded your Books.`,
                        emailFooter: `Thanks for using our requesting service. We appreciate your love and support. Have a nice day.`

                    });

                    //Admin Mail For Books
                    const mailBody = `Name: ${kuetmail.name}\nEmail: ${data.email}\nDepartment: ${kuetmail.department}\nCourse Code: ${data.courseCode}\n\nBooks: ${data.books}`;
                    const sub = `Hutum Books Request From ${kuetmail.name}`;
                    const property = textMailProperty('server', `${process.env.fromEmail}`, sub, mailBody);
                    await sendTextMail(property);

                    //Admin Telegram group for books
                    const message = `------New Book Request------\n\nName: ${kuetmail.name}\nDept: ${kuetmail.department}\nEmail: ${data.email}\nCourse Code: ${encodeURI(data.courseCode)}\n\nBooks: ${encodeURI(data.books)}`
                    await axios.get(`https://api.telegram.org/bot${process.env.telapi}/sendMessage?chat_id=${process.env.chatId}&text=${message}`);
                } else {
                    //For other institutes
                    const mail = emailValidator(data.email);
                    //User mail for Books
                    sendMail({
                        type: `server`,
                        toMail: `${data.email}`,
                        subject: `HUTUM Books Request Service`,
                        header: `Someone From ${mail.institution}`,
                        emailBody: `We have got your request for Books. If your requested Books are already on our database or it's a junk request, we will not reply anything. Otherwise, an admin will let you know after we uploaded your Books.`,
                        emailFooter: `Thanks for using our requesting service. We appreciate your love and support. Have a nice day.`

                    });
                    //Admin Mail For Books
                    const mailBody = `New Requested Books\n\nName: Someone from ${mail.institution}\nEmail: ${data.email}\nCourse Code: Course Code: ${encodeURI(data.courseCode)}\nBooks: ${encodeURI(data.books)}\n\n`;
                    const sub = `New Books Request`;
                    const property = textMailProperty('server', `${process.env.fromEmail}`, sub, mailBody);
                    await sendTextMail(property);

                    //Admin Telegram group for books
                    const message = `------New Book Request------\n\nName: Someone From ${mail.institution}\nEmail: ${data.email}\nCourse Code: ${encodeURI(data.courseCode)}\n\nBooks: ${encodeURI(data.books)}`
                    await axios.get(`https://api.telegram.org/bot${process.env.telapi}/sendMessage?chat_id=${process.env.chatId}&text=${message}`);
                }
            }
            await Requests.deleteOne({ email: data.email, movie: data.movie, series: data.series, books: data.books, courseCode: data.courseCode });

        }
        //Counting the total number of requests
        const counterData = await RequestsCount.find({});
        counterData[0].movie += movieCounter;
        counterData[0].book += bookCounter;
        await counterData[0].save();
    } catch (error) {
        //Alerting Developer about the error
        const mailBody = `There is a problem in Request Sending`;
        const sub = `Request Sending Error`;
        const property = textMailProperty('server', `${process.env.fromEmail}`, sub, mailBody);
        await sendTextMail(property);
        console.log("Error in Request sending to admin \n"+error);
    }
}

module.exports = {
    getRequests,
}