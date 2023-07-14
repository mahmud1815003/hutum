const axios = require('axios');
const moment = require('moment');

const apiurl = `https://api.openweathermap.org/data/2.5/weather?lat=${process.env.lat}&lon=${process.env.lon}&units=metric&appid=${process.env.key}`;

async function getWeatherDataKUET () {
   try{
    const da = await axios.get(apiurl);
    const weatherData = da.data;
    const weatherDescription = weatherData.weather[0].description;
    const temperature = weatherData.main.temp;
    const feels_like = weatherData.main.feels_like;
    const humidity = weatherData.main.humidity;
    const wind = weatherData.wind.speed;
    const sunrise = moment(weatherData.sys.sunrise * 1000).utcOffset(6).format("h:mm a");
    const sunset = moment(weatherData.sys.sunset * 1000).utcOffset(6).format("h:mm a");
    const lastUpdate = moment(weatherData.dt * 1000).utcOffset(6).format("h:mm a");
    return `----KUET Weather Update----\n\nTemperature: ${temperature}°C\nHumidity: ${humidity}%\nFeels Like: ${feels_like}°C\nWind Speed: ${wind} m/s\nSunrise: ${sunrise}\nSunset: ${sunset}\nDescription: ${weatherDescription}\n\n\-----Last Update ${lastUpdate}------\n`
   }catch(error){
     console.log('KUET Weather Error:\n'+error);
     return 'Weather Data Error in HUTUM server';
   }
}

module.exports = {
    getWeatherDataKUET,
}