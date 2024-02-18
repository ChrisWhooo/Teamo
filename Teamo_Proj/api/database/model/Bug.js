const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const BugSchema = new Schema({
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BugGroup",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: String,
  status: {
    type: String,
    enum: ["Open", "Suspended", "Closed"],
    default: "Open",
  },
  issueType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "IssueType",
  },
  processLog: String,
  solution: [
    {   
      content: String,
      timestamp: { type: Date, default: Date.now }
    }
],
  assignedTo: {
    type: String,
   
  },
  createdBy: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
  }, 
    username:String
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Bug', BugSchema);
