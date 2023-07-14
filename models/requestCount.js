const mongoose = require('mongoose');

const requestCountSchema = new mongoose.Schema({
    movie: Number,
    book: Number
});

const count = new mongoose.model('RequestsCount', requestCountSchema);

module.exports = count;