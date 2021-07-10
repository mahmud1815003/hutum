//Dependencies
const moment = require('moment')


//moudle scaffolding
const handler = {}

handler.goodMorning = (agent) => {
    var time24 = moment(new Date()).utcOffset(6).format("hh:mm");
    var time12 = moment(new Date()).utcOffset(6).format("h:mm A");
    //console.log(moment(time24, "hh:mm").valueOf() >= moment('20:00', "hh:mm").utcOffset(6).valueOf() && moment(time24, "hh:mm").valueOf() <= moment('23:00', "hh:mm").utcOffset(6).valueOf());
    //console.log(time24.valueOf());
    if(moment(time12, "h:mma").valueOf() >= moment('5:00 am', "h:mma").utcOffset(6).valueOf() && moment(time12, "h:mma").valueOf() <= moment('07:00 am', "h:mma").utcOffset(6).valueOf()){
      agent.add(`শুভ সকাল তোমাকেও\n${time12}!!!\nবেশ সকালে উঠো বলা যায়...`);
    }else if(moment(time12, "h:mma").valueOf() >= moment('7:00 am', "h:mma").utcOffset(6).valueOf() && moment(time12, "h:mma").valueOf() <= moment('10:00 am', "h:mma").utcOffset(6).valueOf()){
       agent.add(`${time12}🤨🤨\nআরেকটু আগে উঠলে আরও ভালো হয়!!\nযাই হোক শুভ সকাল`);
    }else if(moment(time12, "h:mma").valueOf() >= moment('10:01 am', "h:mma").utcOffset(6).valueOf() && moment(time12, "h:mma").valueOf() <= moment('12:00 am', "h:mma").utcOffset(6).valueOf()){
      agent.add(`${time12}🥱🥱\nআরও জলদি উঠা লাগবে বাবা 😐😐\n`)
    }else{
      agent.add(`${time12}😑😑😑\nএইটা কোন টাইম হইল শুভ সকাল বলার😐😐`);
    }
}

handler.goodNight = (agent) => {
    var time24 = moment(new Date()).utcOffset(6).format("HH:mm");
    var time12 = moment(new Date()).utcOffset(6).format("h:mm A");
    
    if(moment(time24, "hh:mm").valueOf() >= moment('20:00', "hh:mm").utcOffset(6).valueOf() && moment(time24, "hh:mm").valueOf() <= moment('23:00', "hh:mm").utcOffset(6).valueOf()){
       agent.add(`${time12}😲😲\nএত জলদি ঘুমাবা😪😪\nযাই হোক শুভ রাত্রী\nSleep tight😪😪`); 
    }else if((moment(time24, "hh:mm").valueOf() > moment('23:00', "hh:mm").utcOffset(6).valueOf() && moment(time24, "hh:mm").valueOf() <= moment('23:59', "hh:mm").utcOffset(6).valueOf()) || (moment(time24, "hh:mm").valueOf() >= moment('00:00', "hh:mm").utcOffset(6).valueOf() && moment(time24, "hh:mm").valueOf() <= moment('02:00', "hh:mm").utcOffset(6).valueOf())){
       agent.add(`${time12}😍\nমোটামুটি ঠিক সময়েই ঘুমাও😪😪\nযাই হোক শুভ রাত্রী\nHave a nice dream😪😪`);
    }else if((moment(time24, "hh:mm").valueOf() > moment('02:00', "hh:mm").utcOffset(6).valueOf() && moment(time24, "hh:mm").valueOf() <= moment('04:00', "hh:mm").utcOffset(6).valueOf())){
       agent.add(`${time12}🤨🤨\nআরেকটু আগে ঘুমালে আরও ভালো হয়!!\nযাই হোক শুভ রাত্রি🙂`);
    }else{
       agent.add(`${time12}😑😑😑\nএইটা কোন টাইম হইল শুভ রাত্রী বলার😐😐`);
    }
}

handler.goodNoon = (agent) => {
    var time24 = moment(new Date()).utcOffset(6).format("HH:mm");
    var time12 = moment(new Date()).utcOffset(6).format("h:mm A");
    
    if(moment(time24, "hh:mm").valueOf() >= moment('12:00', "hh:mm").utcOffset(6).valueOf() && moment(time24, "hh:mm").valueOf() <= moment('17:00', "hh:mm").utcOffset(6).valueOf()){
       agent.add(`Good Noon😪😪`); 
    }else{
       agent.add(`${time12}😑😑😑\nএইটা কোন টাইম হইল Good Noon বলার😐😐`);
    }
}

handler.goodEvening = (agent) => {
    var time24 = moment(new Date()).utcOffset(6).format("HH:mm");
    var time12 = moment(new Date()).utcOffset(6).format("h:mm A");
    
    if(moment(time24, "hh:mm").valueOf() >= moment('17:01', "hh:mm").utcOffset(6).valueOf() && moment(time24, "hh:mm").valueOf() <= moment('20:00', "hh:mm").utcOffset(6).valueOf()){
       agent.add(`Good Evening😪😪`); 
    }else{
       agent.add(`${time12}😑😑😑\nএইটা কোন টাইম হইল Good Evening বলার😐😐`);
    }
}



module.exports = handler