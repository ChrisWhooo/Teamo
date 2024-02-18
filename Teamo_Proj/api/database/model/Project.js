
const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    id: Number,
    name: String,
    icon: String,
    link: String
});

module.exports = mongoose.model('Project', ProjectSchema);
