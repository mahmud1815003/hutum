const axios = require('axios');
const moment = require("moment");

//Internal Imports 
const {cap} = require('../utilities/capitalLetter');

async function getWeatherData (address) {
    try{
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURI(address)}&units=metric&appid=${process.env.key}`;
        const da = await axios.get(url);
        const weatherData = da.data;
        const weatherDescription = weatherData.weather[0].description;
        const temperature = weatherData.main.temp;
        const feels_like = weatherData.main.feels_like;
        const humidity = weatherData.main.humidity;
        const wind = weatherData.wind.speed;
        const sunrise = moment(weatherData.sys.sunrise * 1000).utcOffset(6).format("h:mm a");
        const sunset = moment(weatherData.sys.sunset * 1000).utcOffset(6).format("h:mm a");
        const lastUpdate = moment(weatherData.dt * 1000).utcOffset(6).format("h:mm a");
        const country = weatherData.sys.country;
        return `------${cap(address)}, ${country} Weather------\n\nTemperature: ${temperature}°C\nHumidity: ${humidity}%\nFeels Like: ${feels_like}°C\nWind Speed: ${wind} m/s\nSunrise: ${sunrise}\nSunset: ${sunset}\nDescription: ${weatherDescription}\n\n\-----Last Update ${lastUpdate}------\n`;
    }catch(error){
        console.log('Weather Data Error: \n'+error);
        return 'Weather Data Error in HUTUM server';
    }
}

module.exports = {
    getWeatherData,
}