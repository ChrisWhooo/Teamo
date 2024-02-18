const mongoose = require('mongoose');

const ListSchema = new mongoose.Schema({
    id:Number,
    boardId:{ type: mongoose.Schema.Types.ObjectId, ref: 'Board' },
    title:String,
    icon:String

});
module.exports=mongoose.model('List',ListSchema);