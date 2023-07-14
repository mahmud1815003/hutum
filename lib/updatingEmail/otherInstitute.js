//External Imports
const axios = require('axios');

//Internal Imports
const Emails = require('../../models/email');
const {sendTextMail, textMailProperty} = require('../../lib/sendTextMail');

const getEmailsofOther = async () => {
    try{
      const mongoData = await Emails.find({});
      const rawData = await axios.get(`${process.env.emailSheetsofOthers}`);
      const sheetData = rawData.data;
      //console.log(sheetData);
      for(let data of mongoData){
        if(data.institution !== 'KUET'){
          let bol = sheetData.find((mail) => {
            if(mail.email.toLowerCase().trim() === data.email.toLowerCase().trim() && mail.isVerified.toLowerCase().trim() === data.isVerified.toLowerCase().trim() && mail.flag.toLowerCase().trim() === data.flag.toLowerCase().trim()){
              return true;
            }
          });
          if(!bol ){
            const x = await Emails.deleteOne({email: data.email});
          }
        }
      }
      for(let data of sheetData){
        let bol = mongoData.find((mail) => {
          if(mail.email.toLowerCase().trim() === data.email.toLowerCase().trim() && mail.isVerified.toLowerCase().trim() === data.isVerified.toLowerCase().trim() && mail.flag.toLowerCase().trim() === data.flag.toLowerCase().trim()){
            return true;
          }
        });
        if(!bol && data.email !== ''){
          const mail = new Emails({
            'email': data.email.toLowerCase().trim(),
            'institution': data.institution,
            'isVerified': data.isVerified.toLowerCase().trim(),
            'flag': data.flag.toLowerCase().trim(),
            'alternate': ''
          });
          await mail.save();
        }
      }
      return true;
    }catch(error){
        const sub = `Email Writing Erorr`;
        const mailBody = `There is a problem in Email Writing to MongoDB in others institutes`;
        const property = textMailProperty('server', `${process.env.fromEmail}`, sub, mailBody);
        await sendTextMail(property);
        
        return false;
    }
}

module.exports = {
    getEmailsofOther,
}