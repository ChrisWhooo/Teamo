const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TodoSchema = new Schema({
    title: { type: String, required: true },
    description: String,
    completed: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: String, required: true },
    updatedBy: String,
    updatedAt: { type: Date },
    dueDate: { type: Date },
    type: { type: String, enum: ['task', 'bug'], required: true },  // Add type
    refId: { type: Schema.Types.ObjectId, required: true },  // Reference to Task or Bug
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo:[String],
    solution: [
        {   
          content: String,
          timestamp: { type: Date, default: Date.now }
        }
    ],
    relatedTaskId:{type:Schema.Types.ObjectId,ref:'Task'},
    relatedBugId:{type:Schema.Types.ObjectId,ref:'Bug'},
});

module.exports = mongoose.model('Todo', TodoSchema);
