const TelegramBot = require('node-telegram-bot-api');

//Telegram Bot Setup
const Bot_token = process.env.botapi;


const bot = new TelegramBot(Bot_token, { polling: true });

module.exports = bot;