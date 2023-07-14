const mongoose = require('mongoose');
const movieSehema = new mongoose.Schema({
    alternative:String,
    Name: String,
    Genre: String,
    Language: String,
    Release: String,
    Links: String,
    tel: String,
    genre: String,
});

movieSehema.index({alternative: "text", Name: "text"});
const movie = new mongoose.model('Movies', movieSehema);

module.exports = movie;