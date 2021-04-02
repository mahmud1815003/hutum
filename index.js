const express = require('express')
const app = express()
const dfff = require('dialogflow-fulfillment')
const {google} = require('googleapis')
const axios = require('axios')
const moment = require('moment')
const cheerio = require('cheerio');

const port = process.env.PORT || 3000

app.get('/',(req,res) =>{
    res.send("We are Live")
})

app.post('/',express.json(), (req,res) =>{
    const agent = new dfff.WebhookClient({
        request : req,
        response : res
    });

    function weatherKuet(agent){
      return axios.get('https://sheetdb.io/api/v1/0m2wuigcrc9lt').then(s=>{
          var d = s.data;
          var a = moment((parseInt(d[0].sunrise))*1000).format('HH:mm:ss');
          var sunrise = moment(a, "HH:mm:ss").format("LT");
          var b = moment((parseInt(d[0].sunset))*1000).format('HH:mm:ss');
          var sunset = moment(b, "HH:mm:ss").format("LT");
          var c = moment((parseInt(d[0].update))*1000).format('HH:mm:ss');
          var updateLast = moment(c, "HH:mm:ss").format("LT");
          agent.add(`----KUET Weather Update----\n\nTemperature: ${d[0].temp}°C\nHumidity: ${d[0].hum}%\nFeels Like: ${d[0].feelslike}°C\nWind Speed: ${d[0].wind} m/s\nSunrise: ${sunrise}\nSunset: ${sunset}\nDescription: ${d[0].description}\n\n\-----Last Update ${updateLast}------\n`);
        
     }).catch(function(error){
       agent.add("Under Maintanance");
     });
    }

    function kuetbus(agent){
          const one = axios.get("https://sheetdb.io/api/v1/fswfudl5bxis9");
          const two = axios.get("https://sheetdb.io/api/v1/h1lgw7pu7fx9q");
          return axios.all([one,two]).then(axios.spread((...response) =>{
            var busdata = response[0].data;       
            for(var i in busdata){
             if(i == 0){
               continue;
             }
             var y = busdata[i].stop.toString();
             var a = "";
             var j = 0;
             while(j < y.length && y[j] != ','){
                 a+=y[j];
                 j++;
             }
             j+=2;
             var b = "";
             while(j < y.length){
               b+=y[j];
               j++;
             }
             agent.add(`${busdata[i].name}\n--------------------------\nFrom Campus: ${busdata[i].start}\nFrom ${a}: ${b}\nRemarks: ${busdata[i].remarks}\n\n-------(Sunday To Thursday)-------\n`);
           }
           var busdata2 = response[1].data;
           for(var i in busdata2){
             if(i == 0)continue;
             var y = busdata2[i].stop.toString();
             var a = "";
             var j = 0;
             while(j < y.length && y[j] != ','){
                 a+=y[j];
                 j++;
             }
             j+=2;
             var b = "";
             while(j < y.length){
               b+=y[j];
               j++;
             }
             agent.add(`${busdata2[i].name}\n--------------------------\nFrom Campus: ${busdata2[i].start}\nFrom ${a}: ${b}\nRemarks: ${busdata2[i].remark}\n\n----------(Only For Saturday)---------\n`);
           }
           agent.add('-----------No Bus on Friday-----------');
          })).catch(function(error){
             agent.add("Under Maintance");
          });
    }

   function coronaUpdate(agent){
    return axios.get('https://corona.gov.bd/').then(corona=>{
      const $ = cheerio.load(corona.data);
      let total_a_r_t = $('div[class = "col-lg-6 text-right"] > h3 > b').text().trim();
      let day_a_r_t = $('div[class = "col-lg-6"] > h3 > b').text().trim();
      let death_all = $('h1[class = "live-update-box-wrap-h1"] > b').text().trim();
      let update = $('div[class = "col-md-12 text-right"] > span').text().trim();
      const first = spliter(total_a_r_t.split(" "));
      const second = spliter(day_a_r_t.split(" "));
      const third = spliter(death_all.split(" "));
      const updater = spliter(update.split(" "));
      agent.add(`---করোনা আপডেট বাংলাদেশ---\n\n    --------গত ২৪ ঘন্টায়------\nআক্রান্তঃ ${second[0]}\nমৃত্যুঃ ${third[0]}\nসুস্থঃ ${second[1]}\nপরীক্ষাঃ ${second[2]}\n\n   --------সর্বোমোট হিসাব-------\nআক্রান্তঃ ${first[0]}\nমৃত্যুঃ ${third[1]}\nসুস্থঃ ${first[1]}\nপরীক্ষাঃ ${first[2]}\n\n${updater[0]} ${updater[1]}\n\n    ---সুত্রঃ ${updater[3]} ${updater[4]}---`);
      
      }).catch(function(error){
        agent.add("Under Maintanance");
    });
    }
    var intentMap = new Map();
    intentMap.set('corona',coronaUpdate);
    intentMap.set('kuetbus',kuetbus);
    intentMap.set('weatherKuet',weatherKuet);
    agent.handleRequest(intentMap);
});



function spliter(data){
  let changedstring = [];
  for(var i in data){
    if(data[i] == '')continue;
    changedstring.push(data[i]);
  }
  return changedstring;
}
// axios.get(gov).then(function(s){
//     const $ = cheerio.load(s.data);
//     let total_a_r_t = $('div[class = "col-md-12 text-right"] > span').text().trim();
//     let x = total_a_r_t.split(' ');
//     let lis = spliter(total_a_r_t.split(" "));
//     let fourth = spliter(lis[1].split(" "));
//     console.log(lis);
// })


app.listen(port,() => {
    console.log(`Listening on Port ${port}`)
})

