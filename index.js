const express = require('express')
const app = express()
const dfff = require('dialogflow-fulfillment')
const {google} = require('googleapis')
const axios = require('axios')
const moment = require('moment')
const cheerio = require('cheerio');
const tabletojson = require('tabletojson').Tabletojson;
const nodemailer = require('nodemailer');
const handler = require('./good');
const {weather} = require('./weather');

const port = process.env.PORT || 3000


let mailTransporter = nodemailer.createTransport({
  service: "gmail",
  host: 'smtp.gmail.com',
  auth: {
      user: `${process.env.fromEmail}`,
      pass: `${process.env.pass}`
  }
});

app.get('/',(req,res) =>{
    res.send("We are Live")
})

app.post('/',express.json(), (req,res) =>{
    const agent = new dfff.WebhookClient({
        request : req,
        response : res
    });


    function kuetbus(agent){
          return tabletojson.convertUrl(
            'https://kuet.ac.bd/index.php/welcome/transportation',
          function(tablesAsJson) {
            for(var i = 0; i < tablesAsJson[0].length && tablesAsJson[0][i].hasOwnProperty('Trip Name'); i++){
                var x = tablesAsJson[0][i]['Starting Spot & Time'].split(" ");
                var y = x[0].replace(',', '');
                agent.add(`${tablesAsJson[0][i]['Trip Name']}\n--------------------------\nFrom Campus: ${tablesAsJson[0][i]['Starting Time from Campus']}\nFrom ${y}: ${x[1]} ${x[2]}\n\nRemarks: ${tablesAsJson[0][i]['Remarks']}\n\n-------(Sunday To Thursday)-------\n`);
            }
            for(var i = 0; i < tablesAsJson[1].length && tablesAsJson[1][i].hasOwnProperty('Trip Name'); i++){
                var x = tablesAsJson[1][i]['Starting Spot & Time'].split(" ");
                var y = x[0].replace(',', '');
                agent.add(`${tablesAsJson[1][i]['Trip Name']}\n--------------------------\nFrom Campus: ${tablesAsJson[1][i]['Starting Time from Campus']}\nFrom ${y}: ${x[1]} ${x[2]}\n\nRemarks: ${tablesAsJson[1][i]['Remarks']}\n\n---------(Only For Saturday)---------\n`);
            }
            agent.add('----------(No Bus on Friday)----------');
            agent.add(new dfff.Card({
             title: 'আরও জানতেঃ',
             text: 'বাস ডাটা, কুয়েট', 
             buttonText: 'Go',
             buttonUrl: 'https://kuet.ac.bd/index.php/welcome/transportation'
            }));
            
        }
      ).catch(function(error){
           agent.add('Under Maintanance');     
      });
    }

    function namazTime(agent){
      return axios.get('https://www.islamicfinder.org/world/bangladesh/1336135/khulna-prayer-times/').then( s=>{
          var laster = s.data;
          const $ = cheerio.load(laster);
          const allTime = $('span[class = "prayertime"]').text();
          const one = $('div[class = "pt-date font-dark font-sm"] > p').text();
          const two = $('p[class = "font-weight-bold pt-date-right"]').text();
          const final = timeSpilter(allTime,one,two);
          agent.add(`---Namaz Schedule of Khulna---\n\nFajr: ${final.namaz[0]} AM\nDhuhr: ${final.namaz[2]} PM\nAsr: ${final.namaz[3]} PM\nMaghrib: ${final.namaz[4]} PM\nIsha: ${final.namaz[5]} PM\n\nDate: ${final.english}\n------------------------------\nSource: Islamic Finder\n`);
          agent.add(new dfff.Card({
             title: 'For more info:',
             buttonText: 'Go',
             buttonUrl: 'https://www.islamicfinder.org/world/bangladesh/1336135/khulna-prayer-times/'
          }));
          
       }).catch(function(error){
          agent.add('Under Maintanance');
       });
  }

    function coronaUpdate(agent){
      return axios.get('https://corona.gov.bd/').then(function(s){
        const $ = cheerio.load(s.data);
        var updater = $('.last-update').text();
        var x = updater.split(" ");
        var y = x[3].split("\n");
        var one = $('div[class = "content"] > table > tbody > tr > td').text();
        var sexy = one.split(" ");
        var tablesAsJson = sexy.filter(String);
       agent.add(`---করোনা আপডেট বাংলাদেশ---\n\n    --------গত ২৪ ঘন্টায়------\nআক্রান্তঃ ${tablesAsJson[2]}\nমৃত্যুঃ ${tablesAsJson[7]}\nসুস্থঃ ${tablesAsJson[12]}\nপরীক্ষাঃ ${tablesAsJson[17]}\n\n   --------সর্বোমোট হিসাব-------\nআক্রান্তঃ ${tablesAsJson[4]}\nমৃত্যুঃ ${tablesAsJson[9]}\nসুস্থঃ ${tablesAsJson[14]}\nপরীক্ষাঃ ${tablesAsJson[19]}\n\n${x[1]} ${x[2]}\n${y[0]} ${y[1]}\n\n    ---সুত্রঃ corona.gov.bd---`); 
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
      }).catch(function(erro){
        agent.add('Under Maintanance');
      });
    }
    function kuetbusHutum(agent){
                   return tabletojson.convertUrl(
        'https://kuet.ac.bd/index.php/welcome/transportation',
          function(tablesAsJson) {
            var sexy = [];
        for(var i = 0; i < tablesAsJson[0].length && tablesAsJson[0][i].hasOwnProperty('Trip Name'); i++){
            var x = tablesAsJson[0][i]['Starting Spot & Time'].split(" ");
            var y = x[0].replace(',', '');
            var coder = y.substring(0,3);
            var dt = moment(tablesAsJson[0][i]['Starting Time from Campus'], ["h:mm A"]).format("HH:mm");
            sexy.push(JSON.stringify({
                                              "payload": {
                                                      "facebook": {
                                                        "attachment": {
                                                          "payload": {
                                                            "intro_message": `${tablesAsJson[0][i]['Trip Name']}`,
                                                            "template_type": "airline_boardingpass",
                                                            "locale": "en_US",
                                                            "boarding_pass": [
                                                              {
                                                                "logo_image_url": "https://www.example.com/en/logo.png",
                                                                "barcode_image_url": "https://github.com/mahmud1815003/mahmud1815003.github.io/blob/main/bus%20cutie.png?raw=true",
                                                                "passenger_name": "কুয়েটিয়ান",
                                                                "pnr_number": "১০১",
                                                                "auxiliary_fields": [
                                                                  {
                                                                    "value": `${tablesAsJson[0][i]['Starting Time from Campus']}`,
                                                                    "label": "Starts"
                                                                  },{
                                                                    "value" : `${tablesAsJson[0][i]['Trip Name']}`,
                                                                     "label" : "Trip Name"
                                                                  },
                                                                  {
                                                                    "value": `${x[1]} ${x[2]}`,
                                                                    "label": "Returns"
                                                                  }
                                                                ],
                                                                "secondary_fields": [
                                                                  {
                                                                    "value": `${tablesAsJson[0][i]['Remarks']}`,
                                                                    "label": "Remarks:"
                                                                  },
                                                                  {
                                                                    "value": "Sunday To Tuesday",
                                                                    "label": "Running Days:"
                                                                  }
                                                                ],
                                                                "seat": "∞",
                                                                "header_image_url": "https://www.example.com/en/fb/header.png",
                                                                "flight_info": {
                                                                  "flight_number": `${tablesAsJson[0][i]['Trip Name']}`,
                                                                  "flight_schedule": {
                                                                    "departure_time": `2016-01-02T${dt}`,
                                                                    "arrival_time": "2016-01-05T17:30"
                                                                  },
                                                                  "departure_airport": {
                                                                    "city": "KUET",
                                                                    "terminal": "69",
                                                                    "gate": "69",
                                                                    "airport_code": "KUET"
                                                                  },
                                                                  "arrival_airport": {
                                                                    "city": `${y}`,
                                                                    "airport_code": `${coder}`
                                                                  }
                                                                }
                                                              }
                                                            ]
                                                          },
                                                          "type": "template"
                                                        }
                                                      }
                                                    },
                                                    "platform": "FACEBOOK"
                                                  }));
            //agent.add(`${tablesAsJson[0][i]['Trip Name']}\n--------------------------\nFrom Campus: ${tablesAsJson[0][i]['Starting Time from Campus']}\nFrom ${y}: ${x[1]} ${x[2]}\n\nRemarks: ${tablesAsJson[0][i]['Remarks']}\n\n-------(Sunday To Thursday)-------\n`);
        }
        for(var i = 0; i < tablesAsJson[1].length && tablesAsJson[1][i].hasOwnProperty('Trip Name'); i++){
            var x = tablesAsJson[1][i]['Starting Spot & Time'].split(" ");
            var y = x[0].replace(',', '');
            var coder = y.substring(0,3);
            var dt = moment(tablesAsJson[1][i]['Starting Time from Campus'], ["h:mm A"]).format("HH:mm");
            sexy.push(JSON.stringify({
                                                    "payload": {
                                                      "facebook": {
                                                        "attachment": {
                                                          "payload": {
                                                            "intro_message": `${tablesAsJson[1][i]['Trip Name']}(Only Staurday)`,
                                                            "template_type": "airline_boardingpass",
                                                            "locale": "en_US",
                                                            "boarding_pass": [
                                                              {
                                                                "logo_image_url": "https://www.example.com/en/logo.png",
                                                                "barcode_image_url": "https://github.com/mahmud1815003/mahmud1815003.github.io/blob/main/bus%20cutie.png?raw=true",
                                                                "passenger_name": "কুয়েটিয়ান",
                                                                "pnr_number": "১০১",
                                                                "auxiliary_fields": [
                                                                  {
                                                                    "value": `${tablesAsJson[1][i]['Starting Time from Campus']}`,
                                                                    "label": "Starts"
                                                                  },{
                                                                    "value" : `${tablesAsJson[1][i]['Trip Name']}`,
                                                                     "label" : "Trip Name"
                                                                  },
                                                                  {
                                                                    "value": `${x[1]} ${x[2]}`,
                                                                    "label": "Returns"
                                                                  }
                                                                ],
                                                                "secondary_fields": [
                                                                  {
                                                                    "value": `${tablesAsJson[1][i]['Remarks']}`,
                                                                    "label": "Remarks:"
                                                                  },
                                                                  {
                                                                    "value": "Only Saturday",
                                                                    "label": "Running Days:"
                                                                  }
                                                                ],
                                                                "seat": "∞",
                                                                "header_image_url": "https://www.example.com/en/fb/header.png",
                                                                "flight_info": {
                                                                  "flight_number": `${tablesAsJson[1][i]['Trip Name']}`,
                                                                  "flight_schedule": {
                                                                    "departure_time": `2016-01-02T${dt}`,
                                                                    "arrival_time": "2016-01-05T17:30"
                                                                  },
                                                                  "departure_airport": {
                                                                    "city": "KUET",
                                                                    "terminal": "69",
                                                                    "gate": "69",
                                                                    "airport_code": "KUET"
                                                                  },
                                                                  "arrival_airport": {
                                                                    "city": `${y}`,
                                                                    "airport_code": `${coder}`
                                                                  }
                                                                }
                                                              }
                                                            ]
                                                          },
                                                          "type": "template"
                                                        }
                                                      }
                                                    },
                                                    "platform": "FACEBOOK"
                                                  }));
            //agent.add(`${tablesAsJson[1][i]['Trip Name']}\n--------------------------\nFrom Campus: ${tablesAsJson[1][i]['Starting Time from Campus']}\nFrom ${y}: ${x[1]} ${x[2]}\n\nRemarks: ${tablesAsJson[1][i]['Remarks']}\n\n---------(Only For Saturday)---------\n`);
        }
        if(sexy.length == 0){
                  agent.add(`No Bus I can find or KUET just Changed its website's layout`);
                  agent.add(new dfff.Card({
                   title: 'আরও জানতেঃ',
                   text: 'বাস ডাটা, কুয়েট', 
                   buttonText: 'Go',
                   buttonUrl: 'https://kuet.ac.bd/index.php/welcome/transportation'
                  }));
               }else{
                    var payload = '{"fulfillmentMessages": ['+sexy+ ']}';
                    res.send(JSON.parse(payload));
               }
      }).catch(function(error){
         agent.add("Under Maintanance");    
         agent.add(new dfff.Card({
                   title: 'আরও জানতেঃ',
                   text: 'বাস ডাটা, কুয়েট', 
                   buttonText: 'Go',
                   buttonUrl: 'https://kuet.ac.bd/index.php/welcome/transportation'
                  }));
      })

   }
   function morningBusHutum(agnet){
      return tabletojson.convertUrl(
       'https://kuet.ac.bd/index.php/welcome/transportation',
       function(tablesAsJson) {
            var CurrentDay = moment(new Date).utcOffset(6).format('dddd');
            if(CurrentDay == "Friday"){
               agent.add("No Bus on Friday");
            }else if(CurrentDay == "Saturday"){
               var sexy = [];
               for(var i = 0; i < tablesAsJson[1].length && tablesAsJson[1][i].hasOwnProperty('Trip Name'); i++){
                  var busstartTime = moment(tablesAsJson[1][i]['Starting Time from Campus'],["h:mm A"]).format("HH:mm");
                  if(busstartTime < '13:00'){
                    var x = tablesAsJson[1][i]['Starting Spot & Time'].split(" ");
                    var y = x[0].replace(',', '');
                    var coder = y.substring(0,3);
                    var dt = moment(tablesAsJson[1][i]['Starting Time from Campus'], ["h:mm A"]).format("HH:mm");
                    sexy.push(JSON.stringify({
                      "payload": {
                        "facebook": {
                          "attachment": {
                            "payload": {
                              "intro_message": `${tablesAsJson[1][i]['Trip Name']}`,
                              "template_type": "airline_boardingpass",
                              "locale": "en_US",
                              "boarding_pass": [
                                {
                                  "logo_image_url": "https://www.example.com/en/logo.png",
                                  "barcode_image_url": "https://github.com/mahmud1815003/mahmud1815003.github.io/blob/main/bus%20cutie.png?raw=true",
                                  "passenger_name": "কুয়েটিয়ান",
                                  "pnr_number": "১০১",
                                  "auxiliary_fields": [
                                    {
                                      "value": `${tablesAsJson[1][i]['Starting Time from Campus']}`,
                                      "label": "Starts"
                                    },{
                                      "value" : `${tablesAsJson[1][i]['Trip Name']}`,
                                       "label" : "Trip Name"
                                    },
                                    {
                                      "value": `${x[1]} ${x[2]}`,
                                      "label": "Returns"
                                    }
                                  ],
                                  "secondary_fields": [
                                    {
                                      "value": `${tablesAsJson[1][i]['Remarks']}`,
                                      "label": "Remarks:"
                                    },
                                    {
                                      "value": "Only Saturday",
                                      "label": "Running Days:"
                                    }
                                  ],
                                  "seat": "∞",
                                  "header_image_url": "https://www.example.com/en/fb/header.png",
                                  "flight_info": {
                                    "flight_number": `${tablesAsJson[1][i]['Trip Name']}`,
                                    "flight_schedule": {
                                      "departure_time": `2016-01-02T${dt}`,
                                      "arrival_time": "2016-01-05T17:30"
                                    },
                                    "departure_airport": {
                                      "city": "KUET",
                                      "terminal": "6",
                                      "gate": "9",
                                      "airport_code": "KUET"
                                    },
                                    "arrival_airport": {
                                      "city": `${y}`,
                                      "airport_code": `${coder}`
                                    }
                                  }
                                }
                              ]
                            },
                            "type": "template"
                          }
                        }
                      },
                      "platform": "FACEBOOK"
                    }));
                  }
               }
               if(sexy.length == 0){
                  agent.add(`No Bus Between 6:00 AM to 1:00 PM on ${CurrentDay}`);
                  agent.add(new dfff.Card({
                   title: 'আরও জানতেঃ',
                   text: 'বাস ডাটা, কুয়েট', 
                   buttonText: 'Go',
                   buttonUrl: 'https://kuet.ac.bd/index.php/welcome/transportation'
                  }));
               }else{
                    var payload = '{"fulfillmentMessages": ['+sexy+ ']}';
                    res.send(JSON.parse(payload));
               }

            }else{
              var sexy = [];
              for(var i= 0; i < tablesAsJson[0].length && tablesAsJson[0][i].hasOwnProperty('Trip Name'); i++){
                var busstartTime = moment(tablesAsJson[0][i]['Starting Time from Campus'],["h:mm A"]).format("HH:mm");
                if(busstartTime < '13:00'){
                  var x = tablesAsJson[0][i]['Starting Spot & Time'].split(" ");
                  var y = x[0].replace(',', '');
                  var coder = y.substring(0,3);
                  var dt = moment(tablesAsJson[0][i]['Starting Time from Campus'], ["h:mm A"]).format("HH:mm");
                  sexy.push(JSON.stringify({
                                                    "payload": {
                                                            "facebook": {
                                                              "attachment": {
                                                                "payload": {
                                                                  "intro_message": `${tablesAsJson[0][i]['Trip Name']}`,
                                                                  "template_type": "airline_boardingpass",
                                                                  "locale": "en_US",
                                                                  "boarding_pass": [
                                                                    {
                                                                      "logo_image_url": "https://www.example.com/en/logo.png",
                                                                      "barcode_image_url": "https://github.com/mahmud1815003/mahmud1815003.github.io/blob/main/bus%20cutie.png?raw=true",
                                                                      "passenger_name": "কুয়েটিয়ান",
                                                                      "pnr_number": "১০১",
                                                                      "auxiliary_fields": [
                                                                        {
                                                                          "value": `${tablesAsJson[0][i]['Starting Time from Campus']}`,
                                                                          "label": "Starts"
                                                                        },{
                                                                          "value" : `${tablesAsJson[0][i]['Trip Name']}`,
                                                                           "label" : "Trip Name"
                                                                        },
                                                                        {
                                                                          "value": `${x[1]} ${x[2]}`,
                                                                          "label": "Returns"
                                                                        }
                                                                      ],
                                                                      "secondary_fields": [
                                                                        {
                                                                          "value": `${tablesAsJson[0][i]['Remarks']}`,
                                                                          "label": "Remarks:"
                                                                        },
                                                                        {
                                                                          "value": "Sunday To Tuesday",
                                                                          "label": "Running Days:"
                                                                        }
                                                                      ],
                                                                      "seat": "∞",
                                                                      "header_image_url": "https://www.example.com/en/fb/header.png",
                                                                      "flight_info": {
                                                                        "flight_number": `${tablesAsJson[0][i]['Trip Name']}`,
                                                                        "flight_schedule": {
                                                                          "departure_time": `2016-01-02T${dt}`,
                                                                          "arrival_time": "2016-01-05T17:30"
                                                                        },
                                                                        "departure_airport": {
                                                                          "city": "KUET",
                                                                          "terminal": "69",
                                                                          "gate": "69",
                                                                          "airport_code": "KUET"
                                                                        },
                                                                        "arrival_airport": {
                                                                          "city": `${y}`,
                                                                          "airport_code": `${coder}`
                                                                        }
                                                                      }
                                                                    }
                                                                  ]
                                                                },
                                                                "type": "template"
                                                              }
                                                            }
                                                          },
                                                          "platform": "FACEBOOK"
                                            }));
                    }
                  }
                    if(sexy.length == 0){
                      agent.add(`No Bus Between 6:00 AM to 1:00 PM on ${CurrentDay}`);
                      agent.add(new dfff.Card({
                       title: 'আরও জানতেঃ',
                       text: 'বাস ডাটা, কুয়েট', 
                       buttonText: 'Go',
                       buttonUrl: 'https://kuet.ac.bd/index.php/welcome/transportation'
                      }));
                   }else{
                      var payload = '{"fulfillmentMessages": ['+sexy+ ']}';
                      res.send(JSON.parse(payload));
                   }
                  }
                }).catch(function(error){
                   agent.add("Under Maintanance");
                   agent.add(new dfff.Card({
                   title: 'আরও জানতেঃ',
                   text: 'বাস ডাটা, কুয়েট', 
                   buttonText: 'Go',
                   buttonUrl: 'https://kuet.ac.bd/index.php/welcome/transportation'
                  }));
                });
      }
   function noonBusHutum(agnet){
       return tabletojson.convertUrl(
         'https://kuet.ac.bd/index.php/welcome/transportation',
         function(tablesAsJson) {
           var CurrentDay = moment(new Date).utcOffset(6).format('dddd');
      if(CurrentDay == "Friday"){
         agent.add("No Bus on Friday");
      }else if(CurrentDay == "Saturday"){
         var sexy = [];
         for(var i = 0; i < tablesAsJson[1].length && tablesAsJson[1][i].hasOwnProperty('Trip Name'); i++){
            var busstartTime = moment(tablesAsJson[1][i]['Starting Time from Campus'],["h:mm A"]).format("HH:mm");
            if(busstartTime >= '13:00' &&  busstartTime <= '17:00'){
              var x = tablesAsJson[1][i]['Starting Spot & Time'].split(" ");
              var y = x[0].replace(',', '');
              var coder = y.substring(0,3);
              var dt = moment(tablesAsJson[1][i]['Starting Time from Campus'], ["h:mm A"]).format("HH:mm");
              sexy.push(JSON.stringify({
                "payload": {
                  "facebook": {
                    "attachment": {
                      "payload": {
                        "intro_message": `${tablesAsJson[1][i]['Trip Name']}`,
                        "template_type": "airline_boardingpass",
                        "locale": "en_US",
                        "boarding_pass": [
                          {
                            "logo_image_url": "https://www.example.com/en/logo.png",
                            "barcode_image_url": "https://github.com/mahmud1815003/mahmud1815003.github.io/blob/main/bus%20cutie.png?raw=true",
                            "passenger_name": "কুয়েটিয়ান",
                            "pnr_number": "১০১",
                            "auxiliary_fields": [
                              {
                                "value": `${tablesAsJson[1][i]['Starting Time from Campus']}`,
                                "label": "Starts"
                              },{
                                "value" : `${tablesAsJson[1][i]['Trip Name']}`,
                                 "label" : "Trip Name"
                              },
                              {
                                "value": `${x[1]} ${x[2]}`,
                                "label": "Returns"
                              }
                            ],
                            "secondary_fields": [
                              {
                                "value": `${tablesAsJson[1][i]['Remarks']}`,
                                "label": "Remarks:"
                              },
                              {
                                "value": "Only Saturday",
                                "label": "Running Days:"
                              }
                            ],
                            "seat": "যেকোনটি",
                            "header_image_url": "https://www.example.com/en/fb/header.png",
                            "flight_info": {
                              "flight_number": "6969",
                              "flight_schedule": {
                                "departure_time": `2016-01-02T${dt}`,
                                "arrival_time": "2016-01-05T17:30"
                              },
                              "departure_airport": {
                                "city": "KUET",
                                "terminal": "6",
                                "gate": "9",
                                "airport_code": "KUET"
                              },
                              "arrival_airport": {
                                "city": `${y}`,
                                "airport_code": `${coder}`
                              }
                            }
                          }
                        ]
                      },
                      "type": "template"
                    }
                  }
                },
                "platform": "FACEBOOK"
              }));
            }
         }
         if(sexy.length == 0){
            agent.add(`No Bus Between 1:01 PM to 5:00 PM on ${CurrentDay}`);
            agent.add(new dfff.Card({
             title: 'আরও জানতেঃ',
             text: 'বাস ডাটা, কুয়েট', 
             buttonText: 'Go',
             buttonUrl: 'https://kuet.ac.bd/index.php/welcome/transportation'
            }));
         }else{
          var payload = '{"fulfillmentMessages": [' +sexy+ ']}';
          res.send(JSON.parse(payload));
         }

      }else{
        var sexy = [];
        for(var i= 0; i < tablesAsJson[0].length && tablesAsJson[0][i].hasOwnProperty('Trip Name'); i++){
          var busstartTime = moment(tablesAsJson[0][i]['Starting Time from Campus'],["h:mm A"]).format("HH:mm");
          if(busstartTime >= '13:00' &&  busstartTime <= '17:00'){
            var x = tablesAsJson[0][i]['Starting Spot & Time'].split(" ");
            var y = x[0].replace(',', '');
            var coder = y.substring(0,3);
            var dt = moment(tablesAsJson[0][i]['Starting Time from Campus'], ["h:mm A"]).format("HH:mm");
            sexy.push(JSON.stringify({
                                              "payload": {
                                                      "facebook": {
                                                        "attachment": {
                                                          "payload": {
                                                            "intro_message": `${tablesAsJson[0][i]['Trip Name']}`,
                                                            "template_type": "airline_boardingpass",
                                                            "locale": "en_US",
                                                            "boarding_pass": [
                                                              {
                                                                "logo_image_url": "https://www.example.com/en/logo.png",
                                                                "barcode_image_url": "https://github.com/mahmud1815003/mahmud1815003.github.io/blob/main/bus%20cutie.png?raw=true",
                                                                "passenger_name": "কুয়েটিয়ান",
                                                                "pnr_number": "১০১",
                                                                "auxiliary_fields": [
                                                                  {
                                                                    "value": `${tablesAsJson[0][i]['Starting Time from Campus']}`,
                                                                    "label": "Starts"
                                                                  },{
                                                                    "value" : `${tablesAsJson[0][i]['Trip Name']}`,
                                                                     "label" : "Trip Name"
                                                                  },
                                                                  {
                                                                    "value": `${x[1]} ${x[2]}`,
                                                                    "label": "Returns"
                                                                  }
                                                                ],
                                                                "secondary_fields": [
                                                                  {
                                                                    "value": `${tablesAsJson[0][i]['Remarks']}`,
                                                                    "label": "Remarks:"
                                                                  },
                                                                  {
                                                                    "value": "Sunday To Tuesday",
                                                                    "label": "Running Days:"
                                                                  }
                                                                ],
                                                                "seat": "যেকোনটি",
                                                                "header_image_url": "https://www.example.com/en/fb/header.png",
                                                                "flight_info": {
                                                                  "flight_number": "6969",
                                                                  "flight_schedule": {
                                                                    "departure_time": `2016-01-02T${dt}`,
                                                                    "arrival_time": "2016-01-05T17:30"
                                                                  },
                                                                  "departure_airport": {
                                                                    "city": "KUET",
                                                                    "terminal": "6",
                                                                    "gate": "9",
                                                                    "airport_code": "KUET"
                                                                  },
                                                                  "arrival_airport": {
                                                                    "city": `${y}`,
                                                                    "airport_code": `${coder}`
                                                                  }
                                                                }
                                                              }
                                                            ]
                                                          },
                                                          "type": "template"
                                                        }
                                                      }
                                                    },
                                                    "platform": "FACEBOOK"
                                      }));
          }
        }
                  if(sexy.length == 0){
                    agent.add(`No Bus Between 1:01 PM to 5:00 PM on ${CurrentDay}`);
                    agent.add(new dfff.Card({
                     title: 'আরও জানতেঃ',
                     text: 'বাস ডাটা, কুয়েট', 
                     buttonText: 'Go',
                     buttonUrl: 'https://kuet.ac.bd/index.php/welcome/transportation'
                    }));
                 }else{
                  var payload = '{"fulfillmentMessages": ['+sexy+']}';
                  res.send(JSON.parse(payload));
                 }
                }
    }).catch(function(error){
       agent.add("Under Maintanance");
       agent.add(new dfff.Card({
                   title: 'আরও জানতেঃ',
                   text: 'বাস ডাটা, কুয়েট', 
                   buttonText: 'Go',
                   buttonUrl: 'https://kuet.ac.bd/index.php/welcome/transportation'
                  }));
    });
}
  
   function eveningBusHutum(agnet){
     return tabletojson.convertUrl(
    'https://kuet.ac.bd/index.php/welcome/transportation',
    function(tablesAsJson) {
      var CurrentDay = moment(new Date).utcOffset(6).format('dddd');
      if(CurrentDay == "Friday"){
         agent.add("No Bus on Friday");
      }else if(CurrentDay == "Saturday"){
         var sexy = [];
         for(var i = 0; i < tablesAsJson[1].length && tablesAsJson[1][i].hasOwnProperty('Trip Name'); i++){
            var busstartTime = moment(tablesAsJson[1][i]['Starting Time from Campus'],["h:mm A"]).format("HH:mm");
            if(busstartTime >= '17:01' &&  busstartTime <= '21:00'){
              var x = tablesAsJson[1][i]['Starting Spot & Time'].split(" ");
              var y = x[0].replace(',', '');
              var coder = y.substring(0,3);
              var dt = moment(tablesAsJson[1][i]['Starting Time from Campus'], ["h:mm A"]).format("HH:mm");
              sexy.push(JSON.stringify({
                "payload": {
                  "facebook": {
                    "attachment": {
                      "payload": {
                        "intro_message": `${tablesAsJson[1][i]['Trip Name']}`,
                        "template_type": "airline_boardingpass",
                        "locale": "en_US",
                        "boarding_pass": [
                          {
                            "logo_image_url": "https://www.example.com/en/logo.png",
                            "barcode_image_url": "https://github.com/mahmud1815003/mahmud1815003.github.io/blob/main/bus%20cutie.png?raw=true",
                            "passenger_name": "কুয়েটিয়ান",
                            "pnr_number": "১০১",
                            "auxiliary_fields": [
                              {
                                "value": `${tablesAsJson[1][i]['Starting Time from Campus']}`,
                                "label": "Starts"
                              },{
                                "value" : `${tablesAsJson[1][i]['Trip Name']}`,
                                 "label" : "Trip Name"
                              },
                              {
                                "value": `${x[1]} ${x[2]}`,
                                "label": "Returns"
                              }
                            ],
                            "secondary_fields": [
                              {
                                "value": `${tablesAsJson[1][i]['Remarks']}`,
                                "label": "Remarks:"
                              },
                              {
                                "value": "Only Saturday",
                                "label": "Running Days:"
                              }
                            ],
                            "seat": "যেকোনটি",
                            "header_image_url": "https://www.example.com/en/fb/header.png",
                            "flight_info": {
                              "flight_number": "6969",
                              "flight_schedule": {
                                "departure_time": `2016-01-02T${dt}`,
                                "arrival_time": "2016-01-05T17:30"
                              },
                              "departure_airport": {
                                "city": "KUET",
                                "terminal": "6",
                                "gate": "9",
                                "airport_code": "KUET"
                              },
                              "arrival_airport": {
                                "city": `${y}`,
                                "airport_code": `${coder}`
                              }
                            }
                          }
                        ]
                      },
                      "type": "template"
                    }
                  }
                },
                "platform": "FACEBOOK"
              }));
            }
         }
         if(sexy.length == 0){
            agent.add(`No Bus Between 5:01 PM to 09:00 PM on ${CurrentDay}`);
            agent.add(new dfff.Card({
             title: 'আরও জানতেঃ',
             text: 'বাস ডাটা, কুয়েট', 
             buttonText: 'Go',
             buttonUrl: 'https://kuet.ac.bd/index.php/welcome/transportation'
            }));
         }else{
          var payload = '{"fulfillmentMessages": [' +sexy+ ']}';
          res.send(JSON.parse(payload));
         }

      }else{
        var sexy = [];
        for(var i= 0; i < tablesAsJson[0].length && tablesAsJson[0][i].hasOwnProperty('Trip Name'); i++){
          var busstartTime = moment(tablesAsJson[0][i]['Starting Time from Campus'],["h:mm A"]).format("HH:mm");
          if(busstartTime >= '17:01' &&  busstartTime <= '21:00'){
            var x = tablesAsJson[0][i]['Starting Spot & Time'].split(" ");
            var y = x[0].replace(',', '');
            var coder = y.substring(0,3);
            var dt = moment(tablesAsJson[0][i]['Starting Time from Campus'], ["h:mm A"]).format("HH:mm");
            sexy.push(JSON.stringify({
                                              "payload": {
                                                      "facebook": {
                                                        "attachment": {
                                                          "payload": {
                                                            "intro_message": `${tablesAsJson[0][i]['Trip Name']}`,
                                                            "template_type": "airline_boardingpass",
                                                            "locale": "en_US",
                                                            "boarding_pass": [
                                                              {
                                                                "logo_image_url": "https://www.example.com/en/logo.png",
                                                                "barcode_image_url": "https://github.com/mahmud1815003/mahmud1815003.github.io/blob/main/bus%20cutie.png?raw=true",
                                                                "passenger_name": "কুয়েটিয়ান",
                                                                "pnr_number": "১০১",
                                                                "auxiliary_fields": [
                                                                  {
                                                                    "value": `${tablesAsJson[0][i]['Starting Time from Campus']}`,
                                                                    "label": "Starts"
                                                                  },{
                                                                    "value" : `${tablesAsJson[0][i]['Trip Name']}`,
                                                                     "label" : "Trip Name"
                                                                  },
                                                                  {
                                                                    "value": `${x[1]} ${x[2]}`,
                                                                    "label": "Returns"
                                                                  }
                                                                ],
                                                                "secondary_fields": [
                                                                  {
                                                                    "value": `${tablesAsJson[0][i]['Remarks']}`,
                                                                    "label": "Remarks:"
                                                                  },
                                                                  {
                                                                    "value": "Sunday To Tuesday",
                                                                    "label": "Running Days:"
                                                                  }
                                                                ],
                                                                "seat": "যেকোনটি",
                                                                "header_image_url": "https://www.example.com/en/fb/header.png",
                                                                "flight_info": {
                                                                  "flight_number": "6969",
                                                                  "flight_schedule": {
                                                                    "departure_time": `2016-01-02T${dt}`,
                                                                    "arrival_time": "2016-01-05T17:30"
                                                                  },
                                                                  "departure_airport": {
                                                                    "city": "KUET",
                                                                    "terminal": "6",
                                                                    "gate": "9",
                                                                    "airport_code": "KUET"
                                                                  },
                                                                  "arrival_airport": {
                                                                    "city": `${y}`,
                                                                    "airport_code": `${coder}`
                                                                  }
                                                                }
                                                              }
                                                            ]
                                                          },
                                                          "type": "template"
                                                        }
                                                      }
                                                    },
                                                    "platform": "FACEBOOK"
                                      }));
          }
        }
              if(sexy.length == 0){
                agent.add(`No Bus Between 5:01 PM to 09:00 PM on ${CurrentDay}`);
                agent.add(new dfff.Card({
                   title: 'আরও জানতেঃ',
                   text: 'বাস ডাটা, কুয়েট', 
                   buttonText: 'Go',
                   buttonUrl: 'https://kuet.ac.bd/index.php/welcome/transportation'
                  }));
             }else{
              var payload = '{"fulfillmentMessages": ['  + sexy + ']}';
              res.send(JSON.parse(payload));
             }
            }
    }).catch(function(error){
       agent.add("Under Maintanance");
       agent.add(new dfff.Card({
                   title: 'আরও জানতেঃ',
                   text: 'বাস ডাটা, কুয়েট', 
                   buttonText: 'Go',
                   buttonUrl: 'https://kuet.ac.bd/index.php/welcome/transportation'
                  }));
    });
}
  
function movieRequest(agent){
        const emailer = agent.parameters.email;
        const movie = agent.parameters.movie;
        const series = agent.parameters.series;
        const regex = /([a-z]+)(([0-9]{2})(25|23|15|29|01|07|09|03|13|11|19|05|27|31|21|17)([0-9]{3}))(@stud.kuet.ac.bd)/i
        if(regex.test(emailer) == false){
          agent.add('সঠিক কুয়েটের ইমেইল দেও নাই 🙂🙂। রিকোয়েস্ট তাই গেলো না 🥴🥴');
          return;
        }
        const dept = {
            '01' : "Civil",
            '03' : "EEE",
            '05' : "ME",
            '07' : "CSE",
            '09' : "ECE",
            '11' : "IEM",
            '13' : "ESE",
            '15' : "BME",
            '17' : "URP",
            '19' : "LE",
            '21' : "TE",
            '23' : "BECM",
            '25' : "ARCH",
            '27' : "MSE",
            '29' : "ChE",
            '31' : "MTE"

        }
        const name = cap(emailer.replace(/(([0-9]{2})(25|23|15|29|01|07|09|03|13|11|19|05|27|31|21|17)([0-9]{3}))(@stud.kuet.ac.bd)/i, ''));
        const roll = emailer.match(/([0-9]{2})(25|23|15|29|01|07|09|03|13|11|19|05|27|31|21|17)([0-9]{3})/i);
        const department = dept[roll[2]];
        let mailDetails = {
            from: `${process.env.fromEmail}`,
            to: `${process.env.toEmail}`,
            subject: `Movie/Series Request From ${name}`,
            text: `Name: ${name}\nEmail: ${emailer}\nMovies: ${movie}\nSeris: ${series}\n`
        };

        mailTransporter.sendMail(mailDetails, function(err, data) {
            if(err) {
                console.log('Error Occurs');
            } else {
                console.log('Your Request Has Been Sent Successfully');
            }
        });

        agent.add(`তোমার ডিটেইলস\n\n\nনামঃ ${name}\nইমেইলঃ ${emailer}\nডিপার্টমেন্টঃ ${department}\nরোলঃ ${roll[0]}\nমুভি: ${movie}\nসিরিজঃ ${series}\n\n\nতোমার রিকুয়েস্ট এডমিন প্যানেলের কাছে পৌছে দেওয়া হয়েছে। কিছুক্ষণের মাঝেই ইমেইলের মাধ্যমে তোমার সাথে যোগাযোগ করা হবে। ধন্যবাদ আমাদের মুভি সার্ভিস ব্যবহারের জন্য`);
}

function currentTime(agent){
   let cTime = new Date();
   let hour = moment(cTime).utcOffset(6).format('h:mm a');
   let day = moment(cTime).utcOffset(6).format('dddd');
   let month = moment(cTime).utcOffset(6).format('MMMM');
   let year = moment(cTime).utcOffset(6).format('YYYY');
   let dateth = moment(cTime).utcOffset(6).format('DD');
   let numberofday = moment(cTime).utcOffset(6).format('DDDD');
   agent.add(`It is ${hour}\n\nToday is ${day}.\n${dateth} ${month}, ${year}...\n\nThis is the ${numberofday} number day of ${year} 😪😪`);

  }

function happyNewYear(agent){
      let cTime = new Date();
      let month = parseInt(moment(cTime).utcOffset(6).format('MM'));
      let date = parseInt(moment(cTime).utcOffset(6).format('DD'));
      let year = moment(cTime).utcOffset(6).format('YYYY');
      if(month === 1 && date === 1){
        agent.add(`Happy New Year ${year}`);
      }else if(month === 4 && date === 14){
        agent.add('শুভ বাংলা নববর্ষ...');
      }else{
        agent.add('আজকে বাংলা বা ইংরেজি কোন বর্ষের প্রথম দিন নয়। কেন হুদাই ফাউ কথা বলতেছো...')
      }
}


    function experiment(agent){
         return axios.get('https://corona.lmao.ninja/v2/countries/BD').then(function(s){
            const coronaData = s.data;
            //console.log(coronaData);
            const updated = moment(coronaData.updated*1000).utcOffset(6).format("h:mm a");
            agent.add(`${coronaData.todayCases}\n${updated}`);
            console.log(updated);
        }).catch((error) =>{
            agent.add('under maintanance');
        });
    }
  
    var intentMap = new Map();
    intentMap.set('corona',coronaUpdate);
    intentMap.set('kuetbus',kuetbus);
    intentMap.set('weatherKuet',weather);
    intentMap.set('namaz',namazTime);
    intentMap.set('kuetBusHutumAll',kuetbusHutum);
    intentMap.set('movie request',movieRequest);
    intentMap.set('hutum says good noon',handler.goodNoon);
    intentMap.set('hutum says good evening',handler.goodEvening);
    intentMap.set('hutum says good morning', handler.goodMorning);
    intentMap.set('hutum says good night', handler.goodNight);
    intentMap.set('kuetBusHutumMorning',morningBusHutum);
    intentMap.set('kuetBusHutumNoon',noonBusHutum);
    intentMap.set('kuetBusHutumEvening',eveningBusHutum);
    intentMap.set('experiment1', experiment);
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

function timeSpilter(allTime, EnglishDate,ArbiDate)
{
  const x = allTime.replace(/AM/g,'');
  const y = x.replace(/PM/g,'').trim();
  const namaz = y.split(' ');
  const english = EnglishDate.replace(ArbiDate,'');
  return {namaz,english};
}

function cap (str){
  return str.charAt(0).toUpperCase() + str.slice(1);
}

app.listen(port,() => {
    console.log(`Listening on Port ${port}`)
})

