const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const issueTypeSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    }
});

const IssueType = mongoose.model('IssueType', issueTypeSchema);

module.exports = IssueType;
