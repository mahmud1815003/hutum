// Author: Jaied Bin Mahmud (KUET BME '18)

//External Imports

const express = require('express')
const app = express()
const dfff = require('dialogflow-fulfillment');
const {Text, Card, Image, Suggestion, Payload} = require('dialogflow-fulfillment');
const axios = require('axios')
const moment = require('moment');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config();

//Internal Imports
const {emailValidator}= require('./lib/emailValidator');
const {kuetMail} = require('./lib/kuetMail');
const {decoder} = require('./lib/trendingMovies');
const {institution} = require('./lib/institute');
const {getWeatherDataKUET} = require('./responseGenerator/weatherDataKUET');
const {getWeatherData} = require('./responseGenerator/weatherData');
const {getNamazTime} = require('./responseGenerator/namazTime');
const {sendTextMail, textMailProperty} = require('./lib/sendTextMail');
const {getMovies} = require('./lib/updateMovieList');
const {getBooks} = require('./lib/updateBookData');
const {getRequests} = require('./lib/requestSending');
const {getEmailsofOther} = require('./lib/updatingEmail/otherInstitute');
const {getEmailsofKUET} = require('./lib/updatingEmail/kuetmails');
const {newEmailOfKUET} = require('./lib/updatingEmail/newEmailsofKUET');
const {cap} = require('./utilities/capitalLetter');
const {randString} = require('./utilities/randomString');
const bot = require('./utilities/bot.js');
const {botHandler} = require('./utilities/botHanler.js');

//Middlewares Imports 
const {addNewMail} = require('./middlewares/addNewMail');

//Environment Variables
const port = process.env.PORT || 3000;

//Mongoose Models
const Movies = require('./models/movie');
const Books = require('./models/book');
const Emails = require('./models/email');
const Requests = require('./models/request');

//Database Connection
mongoose.connect(`mongodb+srv://hutum101:${process.env.mongo}@cluster0.njgbh.mongodb.net/experiment?retryWrites=true&w=majority`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
}, (error) => {
    if(error){
        console.log('Database connection failed '+error);
    }else{
        console.log('MongoDB Connected');
    }
});

//View Engine
app.set('view engine', 'ejs');

//Static Files
app.use('/public',express.static('public'));

//Routes
app.get('/',(req,res) =>{
    res.status(200).json({
      msg: "Hello From HUTUM",
    })
});


//Route for Dialogflow
app.post('/', express.json(), (req, res) => {
  const agent = new dfff.WebhookClient({
    request: req,
    response: res
  });

  async function weatherKuet(agent) {
    const str = await getWeatherDataKUET();
    agent.add(str);
    agent.add(new dfff.Card({
      title: 'More Weather Update',
      text: 'Get your desired city weather',
      buttonText: 'Go',
      buttonUrl: 'weatherother'
    }));
  }

  async function weatherData(agent) {
    const address = agent.parameters.zilla;
    const str = await getWeatherData(address);
    agent.add(str);
    agent.add(new dfff.Card({
      title: 'More Weather Update',
      text: 'Get your desired city weather',
      buttonText: 'Go',
      buttonUrl: 'weatherother'
    }));
  }

  async function coronaUpdate(agent) {
    try {
      const s = await axios.get('https://corona.lmao.ninja/v2/countries?yesterday=false&sort=true');
      const p = await axios.get('https://corona.lmao.ninja/v2/countries?yesterday=true&sort=true');
      const data = s.data.find((item, index) => {
        if (item.country === 'Bangladesh') {
          return index;
        }
      });
      const data1 = p.data.find((item, index) => {
        if (item.country === 'Bangladesh') {
          return index;
        }
      });
      const finalData = {
        update: moment(data.updated).utcOffset(6).format('h:mm A'),
        cases: data.todayCases === 0 ? 'Not Available' : data.todayCases,
        deaths: data.todayDeaths === 0 ? 'Not Available' : data.todayDeaths,
        recovered: data.todayRecovered === 0 ? 'Not Available' : data.todayRecovered,
        totalDeath: data.deaths
      }
      const finalData1 = {
        update: moment(data1.updated).utcOffset(6).format('h:mm A'),
        cases: data1.todayCases,
        deaths: data1.todayDeaths,
        recovered: data1.todayRecovered,
        totalDeath: data1.deaths
      }
      let cTime = new Date();
      let yTime = moment().add(-1, 'days');
      let month = moment(cTime).utcOffset(0).format('MMMM');
      let monthy = moment(yTime).utcOffset(6).format('MMMM');
      let datethy = moment(yTime).utcOffset(6).format('DD');
      let dateth = moment(cTime).utcOffset(0).format('DD');
      let year = moment(cTime).utcOffset(6).format('YYYY');
      agent.add(`---Corona Update Bangladesh---\n\n  -----Update of ${dateth}, ${month}-----\n\nCases: ${finalData.cases}\nRecovered: ${finalData.recovered}\nDeaths: ${finalData.deaths}\nTotal Death: ${finalData.totalDeath}\n\n-----Update of Yesterday-----\n\nCases: ${finalData1.cases}\nRecovered: ${finalData1.recovered}\nDeaths: ${finalData1.deaths}\nTotal Death: ${finalData1.totalDeath}\n\n------------------------\nLast Update:\n${finalData.update}\n${dateth} ${month}, ${year}\n`);
      agent.add(new dfff.Card({
        title: 'গ্রাফিক্যাল ডাটা',
        text: 'কোভিড-১৯ বাংলাদেশ চিত্র',
        buttonText: 'Go',
        buttonUrl: 'https://corona.gov.bd/graph'
      }));
      agent.add(new dfff.Card({
        title: 'হাসপাতাল লিস্ট',
        text: 'কোভিড-১৯ ডেডিকেটেড হাসপাতাল',
        buttonText: 'Go',
        buttonUrl: 'https://corona.gov.bd/dedicated-hospital'
      }));
      agent.add(new dfff.Card({
        title: 'টিকা নিবন্ধন',
        text: 'কোভিড-১৯ ভ্যাকসিন',
        buttonText: 'Go',
        buttonUrl: 'https://surokkha.gov.bd/enroll'
      }));
    } catch (error) {
      //console.log(error);
      agent.add('Under Maintanance');
      agent.add(new dfff.Card({
        title: 'আরও জানতেঃ',
        text: 'করোনা ওয়েব সাইট',
        buttonText: 'Go',
        buttonUrl: 'https://corona.gov.bd/'
      }));
    }
  }
  async function namazTime(agent) {
    const str = await getNamazTime();
    agent.add(str);
    agent.add(new dfff.Card({
      title: 'For more info:',
      buttonText: 'Go',
      buttonUrl: 'https://www.islamicfinder.org/world/bangladesh/1336135/khulna-prayer-times/'
    }));
  }

  function hutumgoodmorning(agent) {
    var time24 = moment(new Date()).utcOffset(6).format("hh:mm");
    var time12 = moment(new Date()).utcOffset(6).format("h:mm A");
    //console.log(moment(time24, "hh:mm").valueOf() >= moment('20:00', "hh:mm").utcOffset(6).valueOf() && moment(time24, "hh:mm").valueOf() <= moment('23:00', "hh:mm").utcOffset(6).valueOf());
    //console.log(time24.valueOf());
    if (moment(time12, "h:mma").valueOf() >= moment('5:00 am', "h:mma").utcOffset(6).valueOf() && moment(time12, "h:mma").valueOf() <= moment('07:00 am', "h:mma").utcOffset(6).valueOf()) {
      agent.add(`শুভ সকাল তোমাকেও\n${time12}!!!\nবেশ সকালে উঠো বলা যায়...`);
    } else if (moment(time12, "h:mma").valueOf() >= moment('7:00 am', "h:mma").utcOffset(6).valueOf() && moment(time12, "h:mma").valueOf() <= moment('10:00 am', "h:mma").utcOffset(6).valueOf()) {
      agent.add(`${time12}🤨🤨\nআরেকটু আগে উঠলে আরও ভালো হয়!!\nযাই হোক শুভ সকাল`);
    } else if (moment(time12, "h:mma").valueOf() >= moment('10:01 am', "h:mma").utcOffset(6).valueOf() && moment(time12, "h:mma").valueOf() <= moment('12:00 am', "h:mma").utcOffset(6).valueOf()) {
      agent.add(`${time12}🥱🥱\nআরও জলদি উঠা লাগবে বাবা 😐😐\n`)
    } else {
      agent.add(`${time12}😑😑😑\nএইটা কোন টাইম হইল শুভ সকাল বলার😐😐`);
    }
  }

  function hutumgoodnight(agent) {
    var time24 = moment(new Date()).utcOffset(6).format("HH:mm");
    var time12 = moment(new Date()).utcOffset(6).format("h:mm A");

    if (moment(time24, "hh:mm").valueOf() >= moment('20:00', "hh:mm").utcOffset(6).valueOf() && moment(time24, "hh:mm").valueOf() <= moment('23:00', "hh:mm").utcOffset(6).valueOf()) {
      agent.add(`${time12}😲😲\nএত জলদি ঘুমাবা😪😪\nযাই হোক শুভ রাত্রী\nSleep tight😪😪`);
    } else if ((moment(time24, "hh:mm").valueOf() > moment('23:00', "hh:mm").utcOffset(6).valueOf() && moment(time24, "hh:mm").valueOf() <= moment('23:59', "hh:mm").utcOffset(6).valueOf()) || (moment(time24, "hh:mm").valueOf() >= moment('00:00', "hh:mm").utcOffset(6).valueOf() && moment(time24, "hh:mm").valueOf() <= moment('02:00', "hh:mm").utcOffset(6).valueOf())) {
      agent.add(`${time12}😍\nমোটামুটি ঠিক সময়েই ঘুমাও😪😪\nযাই হোক শুভ রাত্রী\nHave a nice dream😪😪`);
    } else if ((moment(time24, "hh:mm").valueOf() > moment('02:00', "hh:mm").utcOffset(6).valueOf() && moment(time24, "hh:mm").valueOf() <= moment('04:00', "hh:mm").utcOffset(6).valueOf())) {
      agent.add(`${time12}🤨🤨\nআরেকটু আগে ঘুমালে আরও ভালো হয়!!\nযাই হোক শুভ রাত্রি🙂`);
    } else {
      agent.add(`${time12}😑😑😑\nএইটা কোন টাইম হইল শুভ রাত্রী বলার😐😐`);
    }

  }
  function hutumgoodnoon(agent) {
    var time24 = moment(new Date()).utcOffset(6).format("HH:mm");
    var time12 = moment(new Date()).utcOffset(6).format("h:mm A");

    if (moment(time24, "hh:mm").valueOf() >= moment('12:00', "hh:mm").utcOffset(6).valueOf() && moment(time24, "hh:mm").valueOf() <= moment('17:00', "hh:mm").utcOffset(6).valueOf()) {
      agent.add(`Good Noon😪😪`);
    } else {
      agent.add(`${time12}😑😑😑\nএইটা কোন টাইম হইল Good Noon বলার😐😐`);
    }

  }
  function hutumgoodevening(agent) {
    var time24 = moment(new Date()).utcOffset(6).format("HH:mm");
    var time12 = moment(new Date()).utcOffset(6).format("h:mm A");

    if (moment(time24, "hh:mm").valueOf() >= moment('17:01', "hh:mm").utcOffset(6).valueOf() && moment(time24, "hh:mm").valueOf() <= moment('20:00', "hh:mm").utcOffset(6).valueOf()) {
      agent.add(`Good Evening😪😪`);
    } else {
      agent.add(`${time12}😑😑😑\nএইটা কোন টাইম হইল Good Evening বলার😐😐`);
    }

  }

  async function movieRequest(agent) {
    try {
      const emailer = agent.parameters.emal.toLowerCase().trim();
      console.log(emailer);
      const movie = agent.parameters.movie;
      const series = agent.parameters.series;
      const email = await Emails.findOne({ email: emailer });
      if (email && email.isVerified === 'ok' && email.flag !== 'block') {
        if (email.institution === 'KUET') {
          const kuetmail = kuetMail(emailer);
          const request = new Requests({
            email: emailer,
            movie: movie,
            series: series,
            books: '',
            courseCode: ''
          });
          //agent.add(`---------তোমার ডিটেইলস---------\n\n\nনামঃ ${kuetmail.name}\nডিপার্টমেন্টঃ ${kuetmail.department}\nরোলঃ ${kuetmail.roll}\nইমেইলঃ ${emailer}\n\nমুভিঃ ${movie}\nসিরিজঃ ${series}\n\nতোমার রিকুয়েস্ট এডমিন প্যানেলের কাছে পৌছে দেওয়া হয়েছে।\n\nকিছুক্ষণের মাঝেই তোমার সাথে যোগাযোগ করতে পারবে না ডেভেলপাররা। কারণ সবাই ট্যুরে গেছে । ট্যুর থেকে ফিরে ড্রাইভে আপলোড করবে\n\nধন্যবাদ আমাদের মুভি সার্ভিস ব্যবহারের জন্য।\n\n--------------------------------------\n\nতুমি এখন চাইলে আমাদের মুভি লিস্ট সার্চ করতে পারো। জাস্ট লিখো "search media"। এরপর দেখ ম্যাজিক।`);
          agent.add(`---------তোমার ডিটেইলস---------\n\n\nনামঃ ${kuetmail.name}\nডিপার্টমেন্টঃ ${kuetmail.department}\nরোলঃ ${kuetmail.roll}\nইমেইলঃ ${emailer}\n\n\nমুভিঃ ${movie}\nসিরিজঃ ${series}\n\n\nতোমার রিকুয়েস্ট এডমিন প্যানেলের কাছে পৌছে দেওয়া হয়েছে। কিছুক্ষণের মাঝেই ইমেইলের মাধ্যমে তোমার সাথে যোগাযোগ করা হবে। ধন্যবাদ আমাদের মুভি সার্ভিস ব্যবহারের জন্য।\n\n--------------------------------------\n\nতুমি এখন চাইলে আমাদের মুভি লিস্ট সার্চ করতে পারো। জাস্ট লিখো "search media"। এরপর দেখ ম্যাজিক।`);
          const result = await request.save();
        } else {
          const mail = emailValidator(emailer);
          const request = new Requests({
            email: emailer,
            movie: movie,
            series: series,
            books: '',
            courseCode: ''
          });
          //agent.add(`---------তোমার ডিটেইলস---------\n\n\nনামঃ Someone From ${mail.institution}\nইমেইলঃ ${emailer}\n\nমুভিঃ ${movie}\nসিরিজঃ ${series}\n\nতোমার রিকুয়েস্ট এডমিন প্যানেলের কাছে পৌছে দেওয়া হয়েছে।\n\nকিছুক্ষণের মাঝেই তোমার সাথে যোগাযোগ করতে পারবে না ডেভেলপাররা। কারণ সবাই ট্যুরে গেছে । ট্যুর থেকে ফিরে ড্রাইভে আপলোড করবে\n\nধন্যবাদ আমাদের মুভি সার্ভিস ব্যবহারের জন্য।\n\n--------------------------------------\n\nতুমি এখন চাইলে আমাদের মুভি লিস্ট সার্চ করতে পারো। জাস্ট লিখো "search media"। এরপর দেখ ম্যাজিক।`);
          agent.add(`---------তোমার ডিটেইলস---------\n\n\nনামঃ Someone From ${mail.institution}\nইমেইলঃ ${emailer}\n\n\nমুভিঃ ${movie}\nসিরিজঃ ${series}\n\n\nতোমার রিকুয়েস্ট এডমিন প্যানেলের কাছে পৌছে দেওয়া হয়েছে। কিছুক্ষণের মাঝেই ইমেইলের মাধ্যমে তোমার সাথে যোগাযোগ করা হবে। ধন্যবাদ আমাদের মুভি সার্ভিস ব্যবহারের জন্য।\n\n--------------------------------------\n\nতুমি এখন চাইলে আমাদের মুভি লিস্ট সার্চ করতে পারো। জাস্ট লিখো "search media"। এরপর দেখ ম্যাজিক।`);
          await request.save();
        }
      } else if (email && email.isVerified !== 'ok') {
        agent.add(`তোমার ইমেইলটি ভেরিফাই করা হয়নি এখনো। ${emailer} এর ইনবক্স চেক করো। thebotproject027@gmail.com থেকে একটা ভেরিফিকেশন লিংক যাবে। লিংকে গিয়া ইমেইলটি ভেরিফাই করো`);
      } else if (email && email.flag === 'block') {
        agent.add('তোমার ইমেইল আইডি এডমিন প্যানেল ব্লক করে দিয়েছে। যদি মনে করো এটা ভুলে হয়ছে, তাহলে মেইল করোঃ iamhutum@gmail.com এই ঠিকানায়\n\n--Team Hutum');
      } else {
        agent.add(`${emailer} ইমেইল টি আমাদের সার্ভারে নেই। তুমি চাইলে আমাদের সার্ভারে তোমার প্রতিষ্ঠানের ইমেইল পাঠাতে পারো নিচের বাটনটি চেপে`);
        agent.add(new dfff.Card({
          title: 'Hutum Email Database',
          text: 'Add your institutional Email to our Database',
          buttonText: 'Add Email',
          buttonUrl: 'addyourserver'
        }));
      }
    } catch (error) {
      console.log(error);
      agent.add('There was a Server Side Error😪😪\nWe are looking into this🙂🙂');
    }
  }

  async function bookRequest(agent) {
    try {
      const emailer = agent.parameters.emal.toLowerCase().trim();
      const book = agent.parameters.books;
      const courseCode = agent.parameters.courseCode;
      const email = await Emails.findOne({ email: emailer });
      if (email && email.isVerified === 'ok' && email.flag !== 'block') {
        if (email.institution === 'KUET') {
          const kuetmail = kuetMail(emailer);
          const request = new Requests({
            email: emailer,
            movie: '',
            series: '',
            books: book,
            courseCode: courseCode
          });
          agent.add(`---------তোমার ডিটেইলস---------\n\n\nনামঃ ${kuetmail.name}\nডিপার্টমেন্টঃ ${kuetmail.department}\nরোলঃ ${kuetmail.roll}\nইমেইলঃ ${emailer}\n\n\nকোর্স কোডঃ ${courseCode}\nবুকঃ ${book}\n\n\nতোমার রিকুয়েস্ট এডমিন প্যানেলের কাছে পৌছে দেওয়া হয়েছে। কিছুক্ষণের মাঝেই ইমেইলের মাধ্যমে তোমার সাথে যোগাযোগ করা হবে। ধন্যবাদ আমাদের বুক সার্ভিস ব্যবহারের জন্য।\n\n--------------------------------------\n\nতুমি এখন চাইলে আমাদের বুক লিস্ট সার্চ করতে পারো। জাস্ট লিখো "search book"। এরপর দেখ ম্যাজিক।`);
          await request.save();
        } else {
          const mail = emailValidator(emailer);
          const request = new Requests({
            email: emailer,
            movie: '',
            series: '',
            books: book,
            courseCode: courseCode
          });
          agent.add(`---------তোমার ডিটেইলস---------\n\n\nনামঃ Someone From ${mail.institution}\nইমেইলঃ ${emailer}\n\n\nকোর্স কোডঃ ${courseCode}\nবুকঃ ${book}\n\n\nতোমার রিকুয়েস্ট এডমিন প্যানেলের কাছে পৌছে দেওয়া হয়েছে। কিছুক্ষণের মাঝেই ইমেইলের মাধ্যমে তোমার সাথে যোগাযোগ করা হবে। ধন্যবাদ আমাদের বুক সার্ভিস ব্যবহারের জন্য।\n\n--------------------------------------\n\nতুমি এখন চাইলে আমাদের বুক লিস্ট সার্চ করতে পারো। জাস্ট লিখো "search book"। এরপর দেখ ম্যাজিক।`);
          await request.save();
        }
      } else if (email && email.isVerified !== 'ok') {
        agent.add(`তোমার ইমেইলটি ভেরিফাই করা হয়নি এখনো। ${emailer} এর ইনবক্স চেক করো। thebotproject027@gmail.com থেকে একটা ভেরিফিকেশন লিংক যাবে। লিংকে গিয়া ইমেইলটি ভেরিফাই করো`);
      } else if (email && email.flag === 'block') {
        agent.add('তোমার ইমেইল আইডি এডমিন প্যানেল ব্লক করে দিয়েছে। যদি মনে করো এটা ভুলে হয়ছে, তাহলে মেইল করোঃ iamhutum@gmail.com এই ঠিকানায়\n\n--Team Hutum');
      } else {
        agent.add(`${emailer} ইমেইল টি আমাদের সার্ভারে নেই। তুমি চাইলে আমাদের সার্ভারে তোমার প্রতিষ্ঠানের ইমেইল পাঠাতে পারো নিচের বাটনটি চেপে`);
        agent.add(new dfff.Card({
          title: 'Hutum Email Database',
          text: 'Add your institutional Email to our Database',
          buttonText: 'Add Email',
          buttonUrl: 'addyourserver'
        }));
      }

    } catch (error) {
      console.log(error);
      agent.add('There was a Server Side Error😪😪\nWe are looking into this🙂🙂');
    }
  }

  function currentTime(agent) {
    let cTime = new Date();
    let hour = moment(cTime).utcOffset(6).format('h:mm A');
    let day = moment(cTime).utcOffset(6).format('dddd');
    let month = moment(cTime).utcOffset(6).format('MMMM');
    let year = moment(cTime).utcOffset(6).format('YYYY');
    let dateth = moment(cTime).utcOffset(6).format('DD');
    let numberofday = moment(cTime).utcOffset(6).format('DDDD');
    let kuetMonth = parseInt(moment(cTime).utcOffset(6).format('MM'));
    let kuetDate = parseInt(moment(cTime).utcOffset(6).format('DD'));
    if (kuetMonth === 9 && kuetDate === 1) {
      let payloadData = {
        "facebook": {
          "attachment": {
            "type": "image",
            "payload": {
              "url": "https://bmeboss.files.wordpress.com/2021/09/102813645_1370855803100931_4939088767349122055_n.jpg"
            }
          }
        }
      }


      agent.add('আজকে দেখি ১ সেপ্টেম্বর। আজ ত কুয়েটের জন্মদিন।\n\nটিম হুতুমের পক্ষ থেকে কুয়েটকে জন্মদিনের শুভেচ্ছা জানাই ❤❤');
      //agent.add(new dfff.Payload(agent.UNSPECIFIED, payloadData, {sendAsMessage: true, rawPayload: true})); 
    } else if (kuetMonth === 2 && kuetDate === 21) {
      agent.add('আজকে দেখি ২১ ফেব্রুয়ারি। আজ ত আন্তর্জাতিক মাতৃভাষা দিবস।\n\nটিম হুতুমের পক্ষ থেকে শুভেচ্ছা জানাই ❤❤');
    } else {
      agent.add(`It is ${hour}\n\nToday is ${day}.\n${dateth} ${month}, ${year}...\n\nThis is the ${numberofday} number day of ${year} 😪😪`);
    }

  }

  function happyNewYear(agent) {
    let cTime = new Date();
    let month = parseInt(moment(cTime).utcOffset(6).format('MM'));
    let date = parseInt(moment(cTime).utcOffset(6).format('DD'));
    let year = moment(cTime).utcOffset(6).format('YYYY');
    if (month === 1 && date === 1) {
      agent.add(`Happy New Year ${year}`);
    } else if (month === 4 && date === 14) {
      agent.add('শুভ বাংলা নববর্ষ...');
    } else {
      agent.add('আজকে বাংলা বা ইংরেজি কোন বর্ষের প্রথম দিন নয়। কেন হুদাই ফাউ কথা বলতেছো...')
    }
  }

  async function movieReader(agent) {
    try {
      const movieName = agent.parameters.movie.toLowerCase().trim();
      const movieData = await Movies.find({ $text: { $search: `${movieName}` } }, { score: { $meta: "textScore" } }).sort({ score: { $meta: "textScore" } });
      const movieData2 = await Movies.find({ "Name": new RegExp(movieName, 'i') });
      const lister = [];
      let bol = false;
      for (let movies of movieData) {
        const lowerMovies = movies.Name.toLowerCase().trim();
        const lowerAlter = movies.alternative.toLowerCase().trim();
        const genre = movies.Genre.toLowerCase().trim();
        if (genre === 'movie' || genre === 'animation' || genre === 'documentary') {
          if (movies.Links == '') {
            movies.Links = 'Not in Drive Because of Copyright Issue';
          } else if (movies.tel == '') {
            movies.tel = 'Not in Telegram';
          }
          if (movieName === lowerMovies) {
            agent.add(`----Found Your Movie----\n\nName: ${cap(movies.Name)}\nType: ${cap(movies.Genre)}\nGenre: ${movies.genre}\nLanguage: ${cap(movies.Language)}\nRelease: ${movies.Release}\n\nTelegram:\n${movies.tel}\n\n----Entertainment By Hutum----`);
            bol = true;
          } else if (movieName === lowerAlter) {
            agent.add(`----Found Your Movie----\n\nName: ${cap(movies.Name)}\nType: ${cap(movies.Genre)}\nGenre: ${movies.genre}\nLanguage: ${cap(movies.Language)}\nRelease: ${movies.Release}\n\nTelegram:\n${movies.tel}\n\n----Entertainment By Hutum----`);
            bol = true;
          } else if (movieName[0] === lowerMovies[0]) {
            lister.push(movies);
          } else if (movieName[0] === lowerAlter[0]) {
            lister.push(movies);
          }
        }
      }
      if (!bol && lister.length != 0) {
        agent.add(`------------Not Found------------\n\nHere are the list of Movies that matches your keywords\n`);
        for (let movies of lister) {
          agent.add(`Name: ${cap(movies.Name)}\nType: ${cap(movies.Genre)}\nGenre: ${movies.genre}\nLanguage: ${cap(movies.Language)}\nRelease: ${movies.Release}\n\nTelegram:\n${movies.tel}\n\n----Entertainment By Hutum----`);
        }
        agent.add(new dfff.Card({
          title: 'For Movie Request',
          text: 'Request your movie to us',
          buttonText: 'Movie Request',
          buttonUrl: 'movie request'
        }));
        agent.add(new dfff.Card({
          title: 'For More Movies',
          text: 'Search Our Movie Database',
          buttonText: 'Movie Search',
          buttonUrl: 'movie search'
        }));
      } else if (!bol && movieData2.length === 0) {
        agent.add(`----Not Found Your Movie----`);
        agent.add(new dfff.Card({
          title: 'For Movie Request',
          text: 'Request your movie to us',
          buttonText: 'Movie Request',
          buttonUrl: 'movie request'
        }));
        agent.add(new dfff.Card({
          title: 'For More Movies',
          text: 'Search Our Movie Database',
          buttonText: 'Movie Search',
          buttonUrl: 'movie search'
        }));
      } else if (!bol) {
        for (let movies of movieData2) {
          const lowerMovies = movies.Name.toLowerCase().trim();
          const lowerAlter = movies.alternative.toLowerCase().trim();
          const genre = movies.Genre.toLowerCase().trim();
          if (genre === 'movie' || genre === 'animation' || genre === 'documentary') {
            if (movies.Links == '') {
              movies.Links = 'Not in Drive Because of Copyright Issue';
            } else if (movies.tel == '') {
              movies.tel = 'Not in Telegram';
            }
            if (movieName === lowerMovies) {
              agent.add(`----Found Your Movie----\n\nName: ${cap(movies.Name)}\nType: ${cap(movies.Genre)}\nGenre: ${movies.genre}\nLanguage: ${cap(movies.Language)}\nRelease: ${movies.Release}\n\nTelegram:\n${movies.tel}\n\n----Entertainment By Hutum----`);
              bol = true;
            } else if (movieName === lowerAlter) {
              agent.add(`----Found Your Movie----\n\nName: ${cap(movies.Name)}\nType: ${cap(movies.Genre)}\nGenre: ${movies.genre}\nLanguage: ${cap(movies.Language)}\nRelease: ${movies.Release}\n\nTelegram:\n${movies.tel}\n\n----Entertainment By Hutum----`);
              bol = true;
            }
          }
        }
        if (bol) {
          agent.add(new dfff.Card({
            title: 'For More Movies',
            text: 'Search Our Movie Database',
            buttonText: 'Movie Search',
            buttonUrl: 'movie search'
          }));
        } else {
          agent.add('----Not Found Your Movie----');
          agent.add(new dfff.Card({
            title: 'For Movie Request',
            text: 'Request your movie to us',
            buttonText: 'Movie Request',
            buttonUrl: 'movie request'
          }));
          agent.add(new dfff.Card({
            title: 'For More Movies',
            text: 'Search Our Movie Database',
            buttonText: 'Movie Search',
            buttonUrl: 'movie search'
          }));
        }
      } else {
        agent.add(new dfff.Card({
          title: 'For More Movies',
          text: 'Search Our Movie Database',
          buttonText: 'Movie Search',
          buttonUrl: 'movie search'
        }));
      }
    } catch (error) {
      agent.add('HUTUM server is currently Under Maintanance. Movie/Series/Books search will not work now.\n\n--Team HUTUM');
      console.log(error);
    }
  }

  async function seriesReader(agent) {
    try {
      const seriesName = agent.parameters.series.toLowerCase().trim();
      const movieData = await Movies.find({ $text: { $search: `${seriesName}` } }, { score: { $meta: "textScore" } }).sort({ score: { $meta: "textScore" } });
      const movieData2 = await Movies.find({ "Name": new RegExp(seriesName, 'i') });
      //console.log(movieData2);
      //movieData.sort(SortByName);
      const lister = [];
      let bol = false;
      for (let movies of movieData) {
        const lowerSeries = movies.Name.toLowerCase().trim();
        const lowerAlter = movies.alternative.toLowerCase().trim();
        const genre = movies.Genre.toLowerCase().trim();
        if (genre === 'series') {
          if (movies.Links == '') {
            movies.Links = 'Not in Drive Because of Copyright Issue';
          } else if (movies.tel == '') {
            movies.tel = 'Not in Telegram';
          }
          if (seriesName === lowerSeries) {
            agent.add(`----Found Your Series----\n\nName: ${cap(movies.Name)}\nType: ${cap(movies.Genre)}\nLanguage: ${cap(movies.Language)}\nRelease: ${movies.Release}\n\nTelegram:\n${movies.tel}\n\n----Entertainment By Hutum----`);
            bol = true;
          } else if (seriesName === lowerAlter) {
            agent.add(`----Found Your Series----\n\nName: ${cap(movies.Name)}\nType: ${cap(movies.Genre)}\nLanguage: ${cap(movies.Language)}\nRelease: ${movies.Release}\n\nTelegram:\n${movies.tel}\n\n----Entertainment By Hutum----`);
            bol = true;
          } else if (seriesName[0] === lowerSeries[0]) {
            lister.push(movies);
          } else if (seriesName[0] === lowerAlter[0]) {
            lister.push(movies);
          }
        }
      }
      if (!bol && lister.length != 0) {
        agent.add(`------------Not Found------------\n\nHere are the list of Series that matches your keywords\n`);
        for (let movies of lister) {
          agent.add(`Name: ${cap(movies.Name)}\nType: ${cap(movies.Genre)}\nLanguage: ${cap(movies.Language)}\nRelease: ${movies.Release}\n\nTelegram:\n${movies.tel}\n\n----Entertainment By Hutum----`);
        }
        agent.add(new dfff.Card({
          title: 'For Series Request',
          text: 'Request your series to us',
          buttonText: 'Series Request',
          buttonUrl: 'movie request'
        }));
        agent.add(new dfff.Card({
          title: 'For More Series',
          text: 'Search Our Series Database',
          buttonText: 'Series Search',
          buttonUrl: 'series search'
        }));
        //agent.add(`------Not Found------\n\nIt's the list of Series that Starts with \'${cap(seriesName[0])}\'\n`);
      } else if (!bol && movieData2.length === 0) {
        agent.add(`----Not Found Your Series----`);
        agent.add(new dfff.Card({
          title: 'For Series Request',
          text: 'Request your series to us',
          buttonText: 'Series Request',
          buttonUrl: 'movie request'
        }));
        agent.add(new dfff.Card({
          title: 'For More Series',
          text: 'Search Our Series Database',
          buttonText: 'Series Search',
          buttonUrl: 'series search'
        }));
      } else if (!bol) {
        for (let movies of movieData2) {
          const lowerSeries = movies.Name.toLowerCase().trim();
          const lowerAlter = movies.alternative.toLowerCase().trim();
          const genre = movies.Genre.toLowerCase().trim();
          if (genre === 'series') {
            if (movies.Links == '') {
              movies.Links = 'Not in Drive Because of Copyright Issue';
            } else if (movies.tel == '') {
              movies.tel = 'Not in Telegram';
            }
            if (seriesName === lowerSeries) {
              agent.add(`----Found Your Series----\n\nName: ${cap(movies.Name)}\nType: ${cap(movies.Genre)}\nLanguage: ${cap(movies.Language)}\nRelease: ${movies.Release}\n\nTelegram:\n${movies.tel}\n\n----Entertainment By Hutum----`);
              bol = true;
            } else if (seriesName === lowerAlter) {
              agent.add(`----Found Your Series----\n\nName: ${cap(movies.Name)}\nType: ${cap(movies.Genre)}\nLanguage: ${cap(movies.Language)}\nRelease: ${movies.Release}\n\nTelegram:\n${movies.tel}\n\n----Entertainment By Hutum----`);
              bol = true;
            }
          }
        }
        if (bol) {
          agent.add(new dfff.Card({
            title: 'For More Series',
            text: 'Search Our Series Database',
            buttonText: 'Series Search',
            buttonUrl: 'Series search'
          }));
        } else {
          agent.add(`----Not Found Your Series----`);
          agent.add(new dfff.Card({
            title: 'For Series Request',
            text: 'Request your series to us',
            buttonText: 'Series Request',
            buttonUrl: 'movie request'
          }));
          agent.add(new dfff.Card({
            title: 'For More Series',
            text: 'Search Our Series Database',
            buttonText: 'Series Search',
            buttonUrl: 'animation search'
          }));
        }
      } else {
        agent.add(new dfff.Card({
          title: 'For More Series',
          text: 'Search Our Series Database',
          buttonText: 'Series Search',
          buttonUrl: 'Series search'
        }));
      }
    } catch {
      agent.add('HUTUM server is currently Under Maintanance. Movie/Series/Books search will not work now.\n\n--Team HUTUM');
    }
  }

  async function animationReader(agent) {
    try {
      const seriesName = agent.parameters.series.toLowerCase().trim();
      const movieData = await Movies.find({ $text: { $search: `${seriesName}` } }, { score: { $meta: "textScore" } }).sort({ score: { $meta: "textScore" } });
      const movieData2 = await Movies.find({ "Name": new RegExp(seriesName, 'i') });
      //movieData.sort(SortByName);
      const lister = [];
      let bol = false;
      for (let movies of movieData) {
        const lowerSeries = movies.Name.toLowerCase().trim();
        const lowerAlter = movies.alternative.toLowerCase().trim();
        const genre = movies.Genre.toLowerCase().trim();
        if (genre === 'animation') {
          if (movies.Links == '') {
            movies.Links = 'Not in Drive Because of Copyright Issue';
          } else if (movies.tel == '') {
            movies.tel = 'Not in Telegram';
          }
          if (seriesName === lowerSeries) {
            agent.add(`----Found Your Animation----\n\nName: ${cap(movies.Name)}\nType: ${cap(movies.Genre)}\nLanguage: ${cap(movies.Language)}\nRelease: ${movies.Release}\n\nTelegram:\n${movies.tel}\n\n----Entertainment By Hutum----`);
            bol = true;
          } else if (seriesName === lowerAlter) {
            agent.add(`----Found Your Animation----\n\nName: ${cap(movies.Name)}\nType: ${cap(movies.Genre)}\nLanguage: ${cap(movies.Language)}\nRelease: ${movies.Release}\n\nTelegram:\n${movies.tel}\n\n----Entertainment By Hutum----`);
            bol = true;
          } else if (seriesName[0] === lowerSeries[0]) {
            lister.push(movies);
          } else if (seriesName[0] === lowerAlter[0]) {
            lister.push(movies);
          }
        }
      }
      if (!bol && lister.length != 0) {
        agent.add(`------------Not Found------------\n\nHere are the list of Animation that matches your keywords\n`);
        for (let movies of lister) {
          agent.add(`Name: ${cap(movies.Name)}\nType: ${cap(movies.Genre)}\nLanguage: ${cap(movies.Language)}\nRelease: ${movies.Release}\n\nTelegram:\n${movies.tel}\n\n----Entertainment By Hutum----`);
        }
        agent.add(new dfff.Card({
          title: 'For Animation Request',
          text: 'Request your animation to us',
          buttonText: 'Animation Request',
          buttonUrl: 'movie request'
        }));
        agent.add(new dfff.Card({
          title: 'For More Animation',
          text: 'Search Our Animation Database',
          buttonText: 'Animation Search',
          buttonUrl: 'animation search'
        }));
        //agent.add(`------Not Found------\n\nIt's the list of Animation that Starts with \'${cap(seriesName[0])}\'\n`);
      } else if (!bol && movieData2.length === 0) {
        agent.add(`----Not Found Your Animation----`);
        agent.add(new dfff.Card({
          title: 'For Animation Request',
          text: 'Request your animation to us',
          buttonText: 'Animation Request',
          buttonUrl: 'movie request'
        }));
        agent.add(new dfff.Card({
          title: 'For More Animation',
          text: 'Search Our Animation Database',
          buttonText: 'Animation Search',
          buttonUrl: 'animation search'
        }));
      } else if (!bol) {
        for (let movies of movieData2) {
          const lowerSeries = movies.Name.toLowerCase().trim();
          const lowerAlter = movies.alternative.toLowerCase().trim();
          const genre = movies.Genre.toLowerCase().trim();
          if (genre === 'animation') {
            if (movies.Links == '') {
              movies.Links = 'Not in Drive Because of Copyright Issue';
            } else if (movies.tel == '') {
              movies.tel = 'Not in Telegram';
            }
            if (seriesName === lowerSeries) {
              agent.add(`----Found Your Animation----\n\nName: ${cap(movies.Name)}\nType: ${cap(movies.Genre)}\nLanguage: ${cap(movies.Language)}\nRelease: ${movies.Release}\n\nTelegram:\n${movies.tel}\n\n----Entertainment By Hutum----`);
              bol = true;
            } else if (seriesName === lowerAlter) {
              agent.add(`----Found Your Animation----\n\nName: ${cap(movies.Name)}\nType: ${cap(movies.Genre)}\nLanguage: ${cap(movies.Language)}\nRelease: ${movies.Release}\n\nTelegram:\n${movies.tel}\n\n----Entertainment By Hutum----`);
              bol = true;
            }
          }
        }
        if (bol) {
          agent.add(new dfff.Card({
            title: 'For More Animation',
            text: 'Search Our Animation Database',
            buttonText: 'Animation Search',
            buttonUrl: 'animation search'
          }));
        } else {
          agent.add(`----Not Found Your Animation----`);
          agent.add(new dfff.Card({
            title: 'For Animation Request',
            text: 'Request your animation to us',
            buttonText: 'Animation Request',
            buttonUrl: 'movie request'
          }));
          agent.add(new dfff.Card({
            title: 'For More Animation',
            text: 'Search Our Animation Database',
            buttonText: 'Animation Search',
            buttonUrl: 'animation search'
          }));
        }

      } else {
        agent.add(new dfff.Card({
          title: 'For More Series',
          text: 'Search Our Series Database',
          buttonText: 'Animation Search',
          buttonUrl: 'Animation search'
        }));
      }
    } catch {
      agent.add('HUTUM server is currently Under Maintanance. Movie/Series/Books search will not work now.\n\n--Team HUTUM');
    }
  }


  async function bookReader(agent) {
    try {
      const bookName = agent.parameters.bok.toLowerCase().trim();
      const booksData = await Books.find({ $text: { $search: `${bookName}` } }, { score: { $meta: "textScore" } }).sort({ score: { $meta: "textScore" } });
      //const booksData1 = await Books.find({$text: {$search: `Discrete Mathematics and Its Applications`}}, { score: { $meta: "textScore" } }).sort( { score: { $meta: "textScore" } } );
      //booksData.sort(SortByName); if (bookName[0] === lowerBooks[0]) 
      //console.log(bookName);
      const lister = [];
      let bol = false;
      //console.log(booksData);
      for (let books of booksData) {
        const lowerBooks = books.name.toLowerCase().trim();
        if (books.links == '') {
          books.links = 'Not in Drive Because of Copyright Issue';
        } else if (books.tel == '') {
          books.tel = 'Not in Telegram';
        }
        if (bookName === lowerBooks) {
          agent.add(`----Found Your Book----\n\nName: ${cap(books.name)}\n\nEdition: ${cap(books.edition)}\n\nAuthors: ${cap(books.authors)}\n\n\nDrive Link: ${books.links}\n\nTelegram:\n${books.tel}\n\n----Books By Hutum----`);
          bol = true;
        } else if (bookName[0] === lowerBooks[0]) {
          lister.push(books);
        }
      }
      if (!bol && lister.length != 0) {
        agent.add(`------------Not Found------------\n\nHere are the list of Books that matches your keyword\n`);
        for (let books of lister) {
          agent.add(`Name: ${cap(books.name)}\n\nEdition: ${cap(books.edition)}\n\nAuthors: ${cap(books.authors)}\n\n\nDrive Link: ${books.links}\n\nTelegram:\n${books.tel}\n\n--------Books By Hutum--------`);
        }
        agent.add(new dfff.Card({
          title: 'Hutum Book Request',
          text: 'Request Your Academic Books',
          buttonText: 'Request Book',
          buttonUrl: 'book request'
        }));
        agent.add(new dfff.Card({
          title: 'For More Books',
          text: 'Search Your Academic Books',
          buttonText: 'Book Search',
          buttonUrl: 'book search'
        }));
        //agent.add(`------Not Found------\n\nIt's the list of Books that Starts with \'${cap(bookName[0])}\'\n`);
      } else if (!bol) {
        agent.add(`----Not Found Your Book----`);
        agent.add(new dfff.Card({
          title: 'Hutum Book Request',
          text: 'Request Your Academic Books',
          buttonText: 'Request Book',
          buttonUrl: 'book request'
        }));
        agent.add(new dfff.Card({
          title: 'For More Books',
          text: 'Search Your Academic Books',
          buttonText: 'Book Search',
          buttonUrl: 'book search'
        }));
      } else {
        //agent.add(`----For More Book Search----`);
        agent.add(new dfff.Card({
          title: 'For More Books',
          text: 'Search Your Academic Books',
          buttonText: 'Book Search',
          buttonUrl: 'book search'
        }));
      }
    } catch (error) {
      agent.add('HUTUM server is currently Under Maintanance. Movie/Series/Books search will not work now.\n\n--Team HUTUM');
    }
  }

  async function adminMovie(agent) {
    try {
      const password = agent.parameters.pass;
      if (password === process.env.pass1) {
        agent.add(`Data Writing Report has been sent to Your Email`);
        const bool = await getMovies();
      } else {
        agent.add('Wrong Password')
      }
    } catch {
      agent.add('There is a problem in Server Side');
    }
  }

  async function adminBook(agent) {
    try {
      const password = agent.parameters.pass;
      if (password === process.env.pass1) {
        const bool = await getBooks();
        agent.add(`Data Writing Report has been sent to Your Email`);
      } else {
        agent.add('Wrong Password')
      }
    } catch {
      agent.add('There is problem in Server');
    }
  }
  async function adminStory(agent) {
    try {
      const password = agent.parameters.pass;
      if (password === process.env.pass1) {
        agent.add(`Data Writing Report has been sent to Your Telegram`);
        // const bool = await getStory();
      } else {
        agent.add('Wrong Password')
      }
    } catch {
      agent.add('There is a problem in Server Side');
    }
  }

  async function adminEmail(agent) {
    try {
      const password = agent.parameters.pass;
      if (password === process.env.pass1) {
        const x = await getEmailsofKUET();
        const y = await getEmailsofOther();
        const date = moment(new Date()).utcOffset(6).format('DD/MM/YYYY,  h:mm A');
        if (x && y) {
          const emails = await Emails.find();
          const counter = emails.length;
          const mailBody = `Email Data Writing Successful\nTotal Emails: ${counter}\n\nTime: ${date}`;
          const property = textMailProperty('server', `${process.env.fromEmail}`, `Hutum Email Data Report`, mailBody);
          await sendTextMail(property);
        } else {
          const mailBody = `There is problem in Data Writing to MongoDB. Please Forward this Mail to Developer`;
          const property = textMailProperty('server', `${process.env.fromEmail}`, `Error in Hutum Email Data Report`, mailBody);
          await sendTextMail(property);
        }
        agent.add('Writing Email');
      } else {
        agent.add('Wrong Password')
      }

    } catch {
      agent.add('There is problem in Server');
    }
  }

  function song(agent) {
    const singer = agent.parameters.singer.trim();
    //console.log(singer);
    return axios.get(`https://youtube.googleapis.com/youtube/v3/search?key=${process.env.youtube}&part=snippet&q=${encodeURI(singer)}&maxResults=3`)
      .then((s) => {
        const items = s.data;
        const url = 'https://www.youtube.com/watch?v='
        items.items.forEach(element => {
          agent.add(new dfff.Card({
            title: `${element.snippet.title}`,
            imageUrl: `${element.snippet.thumbnails.high.url}`,
            buttonText: 'Go',
            buttonUrl: `${url + element.id.videoId}`
          }));
          // console.log(url+element.id.videoId);
          // console.log(element.snippet.title);
          // console.log(element.snippet.thumbnails.high.url);
        });
      }).catch((error) => {
        console.log(error);
        agent.add('Could not get your song.\nServer Error.\n--Team HUTUM')
      })
  }

  async function bugReport(agent) {
    try {
      const emailer = agent.parameters.email.toLowerCase().trim();
      const bug = agent.parameters.bug;
      const email = await Emails.findOne({ email: emailer });
      if (email && email.isVerified === 'ok' && email.flag !== 'block') {
        if (email.institution === 'KUET') {
          const kuetmail = kuetMail(emailer);
          const mailBody =  `Name: ${kuetmail.name}\nEmail: ${emailer}\nDept: ${kuetmail.department}\nBug: ${bug}`
          const property = textMailProperty('server',`${process.env.fromEmail}`, `Bug report From ${kuetmail.name}`, mailBody);
          agent.add(`---------তোমার ডিটেইলস---------\n\n\nনামঃ ${kuetmail.name}\nডিপার্টমেন্টঃ ${kuetmail.department}\nরোলঃ ${kuetmail.roll}\nইমেইলঃ ${emailer}\n\n\nবাগঃ ${bug}\n\n\nতোমার রিপোর্ট এডমিন প্যানেলের কাছে পৌছে দেওয়া হয়েছে। কিছুক্ষণের মাঝেই ইমেইলের মাধ্যমে তোমার সাথে যোগাযোগ করা হবে। ধন্যবাদ তোমাকে আমাদের ফিডব্যাক পাঠানোর জন্য\n\n`);
          await sendTextMail(property);
        } else {
          const mail = emailValidator(emailer);
          const mailBody =  `Name: Someone From ${mail.institution}\nEmail: ${emailer}\nBug: ${bug}\n`
          const property = textMailProperty('server',`${process.env.fromEmail}`, `Bug report Someone From ${mail.institution}`, mailBody);
          await sendTextMail(property);
          //agent.add(`---------তোমার ডিটেইলস---------\n\n\nনামঃ Someone From ${mail.institution}\nইমেইলঃ ${emailer}\n\nমুভিঃ ${movie}\nসিরিজঃ ${series}\n\nতোমার রিকুয়েস্ট এডমিন প্যানেলের কাছে পৌছে দেওয়া হয়েছে।\n\nকিছুক্ষণের মাঝেই তোমার সাথে যোগাযোগ করতে পারবে না ডেভেলপাররা। কারণ সবাই ট্যুরে গেছে । ট্যুর থেকে ফিরে ড্রাইভে আপলোড করবে\n\nধন্যবাদ আমাদের মুভি সার্ভিস ব্যবহারের জন্য।\n\n--------------------------------------\n\nতুমি এখন চাইলে আমাদের মুভি লিস্ট সার্চ করতে পারো। জাস্ট লিখো "search media"। এরপর দেখ ম্যাজিক।`);

          agent.add(`---------তোমার ডিটেইলস---------\n\n\nনামঃ Someone From ${mail.institution}\nইমেইলঃ ${emailer}\n\n\nবাগঃ ${bug}\n\n\nতোমার রিপোর্ট এডমিন প্যানেলের কাছে পৌছে দেওয়া হয়েছে। কিছুক্ষণের মাঝেই ইমেইলের মাধ্যমে তোমার সাথে যোগাযোগ করা হবে। ধন্যবাদ তোমাকে আমাদের ফিডব্যাক পাঠানোর জন্য\n\n`);
        }
      } else if (email && email.isVerified !== 'ok') {
        agent.add(`তোমার ইমেইলটি ভেরিফাই করা হয়নি এখনো। ${emailer} এর ইনবক্স চেক করো। hutumserver@gmail.com থেকে ভেরিফিকেশন লিংক গেছে। যদি ইনবক্সে মেইলটি না থাকে তবে স্প্যাম চেক করো। সেই লিংকে গিয়ে ভেরিফাই করে না`);
      } else if (email && email.flag === 'block') {
        agent.add('তোমার ইমেইল আইডি এডমিন প্যানেল ব্লক করে দিয়েছে। যদি মনে করো এটা ভুলে হয়ছে, তাহলে মেইল করোঃ iamhutum@gmail.com এই ঠিকানায়\n\n--Team Hutum');
      } else {
        agent.add(`${emailer} ইমেইল টি আমাদের সার্ভারে নেই। তুমি চাইলে আমাদের সার্ভারে তোমার প্রতিষ্ঠানের ইমেইল পাঠাতে পারো নিচের বাটনটি চেপে`);
        agent.add(new dfff.Card({
          title: 'Hutum Email Database',
          text: 'Add your institutional Email to our Database',
          buttonText: 'Add Email',
          buttonUrl: 'addyourserver'
        }));
      }
    } catch (error) {
      console.log(error);
      agent.add('There was a Server Side Error😪😪\nWe are looking into this🙂🙂');
    }

  }


  async function getEmail(agent) {
    try {
      const email = agent.parameters.emal.toLowerCase().trim();
      const emailFinder = await Emails.findOne({ email: email });
      console.log(agent.parameters.emal);
      if (emailFinder) {
        if (emailFinder.isVerified === 'ok' && emailFinder.flag !== 'block') {
          agent.add('তোমার ইমেইল এড্রেসটি আমাদের সার্ভারে আছে। তাই আর এ্যাড করা লাগবে না');
          return;
        } else if (emailFinder.isVerified !== 'ok') {
          agent.add('তোমার ইমেইলটি ভেরিফাই করা হয়নি এখনো। ইনবক্স চেক করো। hutumserver@gmail.com থেকে একটা ভেরিফিকেশন লিংক যাবে।');
          return;
        } else if (emailFinder.flag === 'block') {
          agent.add('তোমার ইমেইল আইডি এডমিন প্যানেল ব্লক করে দিয়েছে। যদি মনে করো এটা ভুলে হয়ছে, তাহলে মেইল করোঃ iamhutum@gmail.com এই ঠিকানায়\n\n--Team Hutum');
          return;
        }
      } else {
        const uniqueString = randString();
        const validation = emailValidator(email);
        if (validation) {
          const mail = new Emails({
            'email': email,
            'institution': validation.institution,
            'isVerified': uniqueString,
            'flag': '',
            'alternate': ''
          });
          await mail.save();
          const mailBody = `Click The Link to Verify your Email Address.\n\n\nLink: https://${req.get("host")}/verify/${uniqueString}\n\n\nIf you don't send your email to HUTUM server, then please contact:\niamhutum@gmail.com\n\n--Team HUTUM`
          const subject = `Hutum Email Verification For Students`;
          const property = textMailProperty('server', email, subject, mailBody);
          await sendTextMail(property);
          agent.add(`তোমার ${email} এই ঠিকানায় hutumserver@gmail.com থেকে একটি ভেরিফিকেশন লিংক পাঠানো হয়েছে। ইনবক্সে মেইলটি না থাকলে, নিজের মেইলের Spam Box চেক করতে ভুলো না যেন। ভেরিফিকেশন লিংক এ গিয়ে ইমেইল ভেরিফাই করে নাও। ইমেইল ভেরিফিকেশনের পর থেকে তুমি আমাদের সকল ধরণের রিকোয়েস্ট সার্ভিস ব্যবহার করতে পারবে।`);
        } else {
          const x = institution(email);
          if (x) {
            agent.add(`এই মেইলটি ${x} এর সঠিক স্টুডেন্ট মেইল নয়। নিজের সঠিক ভার্সিটির স্টুডেন্ট মেইল দিয়ে আবার ইমেইল এ্যাড করতে চাইলে নিচের বাটনটি চাপো`);
            agent.add(new dfff.Card({
              title: 'Hutum Email Database',
              text: 'Add your institutional Email to our Database',
              buttonText: 'Add Email',
              buttonUrl: 'addyourserver'
            }));

          } else {
            agent.add('এই মেইলটি আমাদের ডাটাবেজের কোন প্রতিষ্ঠানের ইমেইলের সাথে মিলেনি। যদি তুমি তোমার প্রতিষ্ঠানের মেইল আমাদের সার্ভারে এ্যাড করতে চাও তবে মেইল পাঠাও নিচের ইমেইল এড্রেসেঃ\niamhutum@gmail.com');
          }
        }
      }
    } catch (error) {
      agent.add('There is an Server Side Error');
      console.log('Email Taking Error', error);
    }

  }

  async function experiment(agent) {
    try {
      const movieData = await Movies.find();
      let counter = 1;
      for (let movies of movieData) {
        agent.add(`----Found Your Movie----\n\nName: ${cap(movies.Name)}\nType: ${cap(movies.Genre)}\nLanguage: ${cap(movies.Language)}\nRelease: ${movies.Release}\n\nDrive Link: ${movies.Links}\n\n----Entertainment By Hutum----`);

      }
    } catch {
      agent.add('Under Maintanance');
    }
  }

  async function trendingMovies(agent) {
    try {
      const data = await decoder();
      if (data !== false) {
        agent.add('--Top 3 Trending Movies of this Week--');
        for (let movie of data) {
          const image = new Image({
            imageUrl: movie.poster,
            platform: "FACEBOOK"
          });
          agent.add(new Image(image));
          if (movie.name !== movie.original_name) agent.add(`Name: ${movie.name}\n\nOriginal Name: ${movie.original_name}\n\nLanguage: ${movie.language}\n\nRelease Date: ${movie.release}\n\nAge Restriction: ${movie.age_restrictions}\n\n\nOverview:\n\n${movie.overview}`);
          else agent.add(`Name: ${movie.name}\n\nLanguage: ${movie.language}\n\nRelease Date: ${movie.release}\n\nAge Restriction: ${movie.age_restrictions}\n\n\nOverview:\n\n${movie.overview}`);

        }
        agent.add('All the data is from (www.themoviedb.org). We don\'t own any data.\n\n--Team HUTUM');
      } else {
        agent.add('There was a server side error. We are looking into this matter\n\n--Team HUTUM');
      }
    } catch (error) {
      agent.add('There was a server side error. We are looking into this matter\n\n--Team HUTUM');
      console.log(error);
    }
  }

  var intentMap = new Map();
  intentMap.set('corona', coronaUpdate);
  intentMap.set('weather kuet', weatherKuet);
  intentMap.set('weather other', weatherData);
  intentMap.set('namaz', namazTime);
  intentMap.set('movie request', movieRequest);
  intentMap.set('request book', bookRequest);
  intentMap.set('hutum says good noon', hutumgoodnoon);
  intentMap.set('hutum says good evening', hutumgoodevening);
  intentMap.set('hutum says good morning', hutumgoodmorning);
  intentMap.set('hutum says good night', hutumgoodnight);
  intentMap.set('user says time', currentTime);
  intentMap.set('new year', happyNewYear);
  intentMap.set('movie search', movieReader);
  intentMap.set('series search', seriesReader);
  intentMap.set('animation search', animationReader);
  intentMap.set('book search', bookReader);
  intentMap.set('experiment', experiment);
  intentMap.set('admin movie', adminMovie);
  intentMap.set('admin story', adminStory);
  intentMap.set('admin book', adminBook);
  intentMap.set('admin email', adminEmail);
  intentMap.set('hutum is asked for music', song);
  intentMap.set('bug report server', bugReport);
  intentMap.set('email get', getEmail);
  intentMap.set('movie trending', trendingMovies);
  agent.handleRequest(intentMap);
});


app.get('/verify/:uniqueString', addNewMail); 
  


setInterval(getMovies, 4*60*60*1000);
setInterval(getBooks, 6*60*60*1000);
setInterval(getRequests, 2 * 60 * 1000);
setInterval(async () => {
  try{
    const res = await axios.get(process.env.hutumwebsite);
    // console.log(res.data);
  }catch(error) {
    // console.log(error.message);
  }
}, 6 * 1000);
// setInterval(newEmailOfKUET, 4*60*60*1000);
//getBooks();
//getEmailsofOther();
//getEmailsofKUET();
//newEmailOfKUET();

//Server Listening

bot.on('message', botHandler);

app.listen(port, () => {
  console.log(`Listening on Port ${port}`)
})

