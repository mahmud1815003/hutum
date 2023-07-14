const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
    email: String,
    movie: String,
    series: String,
    books: String,
    courseCode: String
});

const request = new mongoose.model('Requests', requestSchema);

module.exports = request;