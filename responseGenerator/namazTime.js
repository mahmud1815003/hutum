const axios = require('axios');
const moment = require('moment');
const cheerio = require('cheerio');

//Internal Imports
const {timeSpilter} = require('../utilities/timeSplitter');

const apiurl = `https://api.openweathermap.org/data/2.5/weather?lat=${process.env.lat}&lon=${process.env.lon}&units=metric&appid=${process.env.key}`;

async function getNamazTime() {
    try {
        const data = await axios.get('https://www.islamicfinder.org/world/bangladesh/1336135/khulna-prayer-times/'); 
        var laster = data.data;
        const $ = cheerio.load(laster);
        const allTime = $('span[class = "prayertime"]').text();
        const one = $('div[class = "pt-date font-dark font-sm"] > p').text();
        const two = $('p[class = "font-weight-bold pt-date-right"]').text();
        const final = timeSpilter(allTime, one, two);
        return `---Namaz Schedule of Khulna---\n\nFajr: ${final.namaz[0]} AM\nDhuhr: ${final.namaz[2]} PM\nAsr: ${final.namaz[3]} PM\nMaghrib: ${final.namaz[4]} PM\nIsha: ${final.namaz[5]} PM\n\nDate: ${final.english}\n------------------------------\nSource: Islamic Finder\n`
    } catch (error) {
        console.log('Namaz Time Error:\n' + error);
        return 'Namaz Time Error in HUTUM server';
    }
}

module.exports = {
    getNamazTime,
}