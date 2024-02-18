const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
    id:Number,
    name: String,
    email: String,
    role: String
});

const Member = mongoose.model('Member', memberSchema);

module.exports = Member;
