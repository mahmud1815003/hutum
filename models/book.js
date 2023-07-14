const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    name: String,
    edition: String,
    authors: String,
    links: String,
    tel: String
});

bookSchema.index({Name: "text"});

const books = new mongoose.model('Books', bookSchema);

module.exports = books;