const mongoose = require('mongoose');
const storySehema = new mongoose.Schema({
    alternative:String,
    Name: String,
    Links: String,
    tel: String
});

storySehema.index({alternative: "text", Name: "text"});
const story = new mongoose.model('Stories', storySehema);

module.exports = story;