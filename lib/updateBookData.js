//External Imports
const axios = require('axios');
const moment = require('moment');

//Internal Imports
const Books = require('../models/book');
const RequestsCount = require('../models/requestCount');
const { sendTextMail, textMailProperty } = require('../lib/sendTextMail');

const getBooks = async () => {
    try {
        const someData = await axios.get(`${process.env.bookData}`);
        const booksData = someData.data;
        let mongodbBooks = await Books.find();
        let update = 0;
        let deleted = 0;
        let finalBooks = mongodbBooks.length;
        for (let i of mongodbBooks) {
            let bool = booksData.find((book, index) => {
                if (book.name === i.name && book.authors === i.authors && book.edition === i.edition && book.links === i.links && book.tel === i.tel) {
                    return true;
                }
            });
            if (!bool) {
                deleted++;
                Books.deleteOne({ name: i.name, edition: i.edition, authors: i.authors, links: i.links, tel: i.tel }, (error) => {
                    if (error) console.log('Removing Error ' + error);
                });
            }
        }

        for (let i of booksData) {
            const bool = mongodbBooks.find((book) => {
                if (book.name === i.name && book.authors === i.authors && book.edition === i.edition && book.links === i.links && book.tel === i.tel) {
                    return true;
                }
            });
            if (!bool && (i.links != '' || i.tel != '') && i.Name != '') {
                update++;
                const finalData = new Books(i);
                finalData.save((error) => {
                    if (error) console.log('Error ' + error);
                });
            }
        }
        finalBooks = finalBooks - deleted + update;

        const dat = await RequestsCount.find({});
        const data = dat[0];
        const date = moment(new Date()).utcOffset(6).format('DD/MM/YYYY,  h:mm A');
        const message = `------Books Data Report------\n\nAdded Books: ${update}\nDeleted Books: ${deleted}\n\nTotal Books: ${finalBooks}\nTotal Movie Request: ${data.movie} (since 24/10/21)\n\nTotal Book Request: ${data.book} (since 24/10/21)\n\nUpdated: ${date}`;
        await axios.get(`https://api.telegram.org/bot${process.env.telapi}/sendMessage?chat_id=${process.env.chatId}&text=${message}`);
    } catch (error) {
        console.log('Writing Error ' + error);

        //Mailing 
        const sub = `Error in Hutum Book Data Writing`;
        const mailBody = `There is problem in Data Writing to MongoDB. Please Forward this Mail to Developer`;
        const property = textMailProperty('server', `${process.env.fromEmail}`, sub, mailBody);
        await sendTextMail(property);

        //Telegram Group Message
        const message = `------Book Data Report------\n\nThere is a problem in Movie Database Update ${error}`;
        await axios.get(`https://api.telegram.org/bot${process.env.telapi}/sendMessage?chat_id=${process.env.chatId}&text=${message}`);

        return false;
    }
}

module.exports = {
    getBooks,
}