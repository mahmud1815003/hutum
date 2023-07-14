//External Imports
const axios = require('axios');

//Internal Imports
const { sendTextMail, textMailProperty } = require('../../lib/sendTextMail');
const {emailValidator} = require('../emailValidator');
const {kuetMail} = require('../kuetMail');
const {binary_search} = require('../../utilities/binary_search');

async function newEmailOfKUET(){
    try{
        const a = await axios.get(process.env.emailSheetsofKUET);
        const b = await axios.get(process.env.emailofNewComer);
        const serverEmails = a.data;
        const emails = b.data;
        let emailList = [];
        for(let x of emails){
            let newEmail = x['Enter Your KUET mail'].toLowerCase().trim();
            if(emailValidator(newEmail) !== false){
                const emailData = kuetMail(newEmail);
                emailList.push({
                  ...emailData,
                  email: newEmail,
                });
            }
        }
        emailList.sort((a,b) => {
            return ((a.roll == b.roll) ? 0 : ((a.roll > b.roll) ? 1 : -1));
        });
        serverEmails.sort((a,b) => {
            return ((a.roll == b.roll) ? 0 : ((a.roll > b.roll) ? 1: -1));
        })
        //console.log(serverEmails);
        let newEmails = [];
        for(let data of emailList){
            if((binary_search(serverEmails,data.roll,true,'roll') == false) && binary_search(newEmails,data.roll,true,'roll') == false){
                newEmails.push({
                    'email': data.email,
                    'roll': data.roll,
                    'department': data.department,
                    'year': parseInt(data.roll.slice(0,2))+2000,
                    'isVerified': 'ok',
                    'flag': '',
                    'alternate': ''
                })
            }
        }
        const body = {
            'data' : newEmails
        }
        console.log(body);
        const message = `------NEW KUET MAIL------\n\nHUTUM gets ${newEmails.length} responses from HUTUM Google form.\n\nForm Link: https://forms.gle/a7Zsfm5qS9gCYHes9\n\nPlease add these Email to HUTUM Email group to give access to Academic Materials of HUTUM`;
        await axios.get(`https://api.telegram.org/bot${process.env.telapi}/sendMessage?chat_id=${process.env.chatId}&text=${message}`);
        if(newEmails.length !== 0)await axios.post(process.env.emailSheetsofKUET,body);
    }catch(error){
        console.log(error);
        const sub = `Email Writing Erorr of new KUET mails`;
        const mailBody = `There is a problem in Google Form Email Writing to Google Sheets`;
        const property = textMailProperty('server', `${process.env.fromEmail}`, sub, mailBody);
        await sendTextMail(property);
    }
} 

module.exports = {
    newEmailOfKUET,
}