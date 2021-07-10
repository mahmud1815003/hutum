//Dependencise
const axios = require('axios');
const moment = require('moment');

//module scaffolding
const handler = {};

const key = "589db9eace2504c5712122fee0f261af";
const lat = 22.899470169557958;
const lon = 89.50105830838595;
const apiurl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${key}`;

handler.weather = (agent) =>{
    return axios.get(apiurl).then((da) => {
        const weatherData = da.data;
        //console.log(weatherData);
        const weatherDescription = weatherData.weather[0].description;
        const temperature = weatherData.main.temp;
        const feels_like = weatherData.main.feels_like;
        const humidity = weatherData.main.humidity;
        const wind = weatherData.wind.speed;
        const sunrise = moment(weatherData.sys.sunrise*1000).utcOffset(6).format("h:mm a");
        const sunset = moment(weatherData.sys.sunset*1000).utcOffset(6).format("h:mm a");
        const lastUpdate = moment(weatherData.dt*1000).utcOffset(6).format("h:mm a");
        agent.add(`----KUET Weather Update----\n\nTemperature: ${temperature}°C\nHumidity: ${humidity}%\nFeels Like: ${feels_like}°C\nWind Speed: ${wind} m/s\nSunrise: ${sunrise}\nSunset: ${sunset}\nDescription: ${weatherDescription}\n\n\-----Last Update ${lastUpdate}------\n`);
        
    }).catch((erro) => {
        agent.add('Weather Data Server is Under Maintanance')
    });
}

module.exports = handler;