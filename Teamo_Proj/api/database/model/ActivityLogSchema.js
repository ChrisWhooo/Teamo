const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ActionTypes = Object.freeze({
    CREATED: 'CREATED',
    STATUS_CHANGE: 'STATUS_CHANGE',
    TITLE_CHANGE: 'TITLE_CHANGE',
    DESCRIPTION_CHANGE: 'DESCRIPTION_CHANGE',
    ASSIGNED_USER_CHANGE: 'ASSIGNED_USER_CHANGE',
    PRIORITY_CHANGE:'PRIORITY_CHANGE',
    MEMBER_ADDED:'MEMBER_ADDED',
    MEMBER_REMOVED:'MEMBER_REMOVED'
});

const ActivityLogSchema = new Schema({
    action: {
        type: String,
        enum: Object.values(ActionTypes), // 确保只使用定义的操作类型
        required: true
    },
    user: {   // 执行操作的用户的名字
        type: String,
        required: true
    },
    details: {
        oldStatus: String,
        newStatus: String,
        oldTitle: String,
        newTitle: String,
        oldDescription: String,
        newDescription: String,
        oldAssignedUser: String,
        newAssignedUser: String,
        oldPriority:String,
        newPriority:String,
        addedMember:String,
        removedMember:String
    },
    participants: [String], // 与此操作相关的其他用户的列表
    timestamp: {    // 该操作的时间戳
        type: Date,
        default: Date.now
    }
});

module.exports = {
    ActivityLogSchema,
    ActionTypes
};
