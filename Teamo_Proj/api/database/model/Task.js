const mongoose = require('mongoose');
const { ActivityLogSchema} = require('./ActivityLogSchema');

const Schema = mongoose.Schema;

// 首先，定义一个评论的模式
const CommentSchema = new Schema({
    content: String,         // 评论的内容
    author: String,          // 评论的作者
    date: {                  // 评论的日期
        type: Date,
        default: Date.now
    },
    replies: [this] // 这里使用this来引用当前模式，实现嵌套回复
   
});

// 为附件定义一个模式。这可以为以后添加更多的附件属性（如文件名、文件类型等）提供扩展性
const AttachmentSchema = new Schema({
    url: String,      // 文件在云存储中的URL
    originalName: String,     // 文件名，可选
    encodedName:String,
    type: String,     // 文件类型，例如'image/png'或'application/pdf'
    size: Number      // 文件大小（字节），可选
});


const TaskSchema = new Schema({
    parentTask: { type: Schema.Types.ObjectId, ref: 'Task', default: null }, // 当该任务是子任务时有值，否则为null
    list_id: { type: Schema.Types.ObjectId, ref: 'List' },
    listId: Number,
    id: Number,
    title: String,
    description: String,
    type:String,
    status: { type: String, enum: ['待处理', '进行中', '已完成'] }, // 使用枚举来限制状态值
    assignedTo: [String],
    comments: [CommentSchema],
    attachments: [AttachmentSchema], // 新增的附件属性
    solution: [
        {   
          content: String,
          timestamp: { type: Date, default: Date.now }
        }
    ],
    
    createdBy: { type: String, required: true },
    dueDate: Date, // 新增的截止日期字段
    priority: { type: String, enum: ['高', '中', '低'] }, // 新增的优先级字段
    tags: [String], // 新增的标签或类别字段
    color: String , // 新增的颜色标记字段
    activities: [ActivityLogSchema],
    subTasks: [{ type: Schema.Types.ObjectId, ref: 'SubTask' }],
    subTasksTitle:[String]
}, {
    timestamps: true    
});

module.exports = mongoose.model('Task', TaskSchema);
