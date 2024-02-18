const mongoose = require('mongoose');

const BoardMembersSchema = new mongoose.Schema({
    boardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Board' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    boardRole: {
        type: String,
        enum: ['OWNER', 'INVITED'],
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('BoardMember', BoardMembersSchema);
