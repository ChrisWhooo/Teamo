const mongoose = require('mongoose');

const BoardSchema = new mongoose.Schema({
   
    projectId:Number,
    name:String,
    icon:String,
    link:String,
    createdBy: { type: String, required: true },  // 创建人
    creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, {
    timestamps: true
});

module.exports=mongoose.model('Board',BoardSchema);