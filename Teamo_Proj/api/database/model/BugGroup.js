const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BugGroupSchema = new Schema({
    groupName: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId, // 使用 ObjectId 参考用户模型
        ref: "User", // 假设你的用户模型的名称为 "User"
        username:String
      },
       // 存储可访问用户信息的字段
    accessibleUsers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            username:String
        }
    ]
});
module.exports = mongoose.model('BugGroup', BugGroupSchema);