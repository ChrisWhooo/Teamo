const mongoose = require('mongoose');

const UserTaskSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
    relationship: {
        type: String,
        enum: ['CREATED_BY', 'ASSIGNED_TO'],
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('UserTask', UserTaskSchema);
