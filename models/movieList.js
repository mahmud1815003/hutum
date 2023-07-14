// Job Guru Server
// Developed by Jaied Bin Mahmud
// KUET BME '18

//External Imports
const mongoose = require('mongoose');


//Schema 

const botMovieSchema = mongoose.Schema({
    sender: {
        type: String,
    },
    senderId: String,
    msg_id: String,
    name: String,
    imdb_id: String,
    type: String,
});


//Model

const botMovieModel = mongoose.model('BotMovie', botMovieSchema);


module.exports = {
    botMovieModel,
}