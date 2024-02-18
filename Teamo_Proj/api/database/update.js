const mongoose = require('mongoose');
const Board = require('./model/Board');
const BoardMember = require('./model/BoardMember');
const Task = require('./model/Task');
const User = require('./model/User');
const Bug = require('./model/Bug');
// 连接到MongoDB
mongoose.connect('mongodb://localhost:27017/database', { useNewUrlParser: true, useUnifiedTopology: true });

async function update() {
    await Task.updateMany({}, { solution: [] }); // 将所有task文档的solution字段设置为空数组
    console.log('Solutions cleared successfully');
}

update().then(() => {
    console.log('Tasks updated successfully');
    mongoose.disconnect();
}).catch(error => {
    console.error('Error updating tasks:', error);
    mongoose.disconnect();
});

// async function resetDatabase() {
//     // 删除所有用户
//     await User.deleteMany({});

//     // 添加您想要保留的用户
  

//     console.log('Database has been reset!');
// }

// resetDatabase().then(() => {
//     console.log('Database reset successfully');
// }).catch(error => {
//     console.error('Error resetting the database:', error);
// });
