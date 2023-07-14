const mongoose = require('mongoose');

const emailSchema = new mongoose.Schema({
    email: String,
    institution: String,
    isVerified: String,
    flag: String,
    alternate: String
});

const email = new mongoose.model('Emails', emailSchema);

module.exports = email;