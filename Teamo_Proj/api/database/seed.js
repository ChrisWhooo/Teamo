const mongoose = require('mongoose');
const Project = require('./model/Project');
const Board = require('./model/Board');
const List = require('./model/List');
const Task = require('./model/Task');
const Member = require('./model/Member');
const defaultCreatedBy = "Chris Wu";


// 连接到MongoDB
mongoose.connect('mongodb://localhost:27017/database', { useNewUrlParser: true, useUnifiedTopology: true });

// 定义种子数据
const projectsData = [
    { id: 1, name: '项目1', icon: 'icon1', link: '/projects/1' },
    { id: 2, name: '项目2', icon: 'icon2', link: '/projects/2' }
];

const boardsData = [
    { project_id: 1, id:1, name: '看板A', icon: 'iconA', link: `/boards/1`,createdBy: defaultCreatedBy },
    { project_id: 1, id:2, name: '看板B', icon: 'iconB', link: '/boards/2',createdBy: defaultCreatedBy },
    { project_id: 2, id:3, name: '看板C', icon: 'iconC', link: '/boards/3',createdBy: defaultCreatedBy }
];

const listsData = [
    { id: 1, boardId: 1, title: '待处理' },
    { id: 2, boardId: 1, title: '进行中' },
    { id: 3, boardId: 1, title: '已完成' },
    { id: 4, boardId: 2, title: '已完成' }
];

const tasksData = [
    {
      list_id: '64f1962984e5ced5388ebcde',
      listId: 1,
      id: 1,
      title: "Task 1",
      description: "This is a sample task description",
      status: "进行中",
      assignedTo: [],  // 可以根据需要添加被分配人员的数组
      comments: [],
      createdBy: defaultCreatedBy,
      dueDate: new Date("2023-07-31"),  
      priority: "中",  
      tags: ["示例标签1", "示例标签2"],  
      
    },
    {
      list_id: '64f1962984e5ced5388ebcde',
      listId: 1,
      id: 2,
      title: "Task 2",
      description: "This is a sample task description",
      status: "进行中",
      assignedTo: [],
      comments: [],
      createdBy: defaultCreatedBy,
      dueDate: new Date("2023-10-31"),  
      priority: "高",
      tags: ["示例标签3", "示例标签4"],
      
    }
];


const membersData = [
    { id: 1, name: "Chris Wu", email: "wuhan6582@gmail.com", role: "Project Manager" },
    { id: 2, name: "Tony Stark", email: "tony.stark@example.com", role: "Front-end Developer" },
    { id: 3, name: "Steve Rogers", email: "steve.rogers@example.com", role: "Back-end Developer" },
    { id: 4, name: "Wanda Maximoff", email: "wanda.maximoff@example.com", role: "UI/UX Designer" },
    { id: 5, name: "Vision", email: "vision@example.com", role: "QA Engineer" },
    { id: 6, name: "Thor", email: "thor@example.com", role: "DevOps Engineer" },
    { id: 7, name: "Strange", email: "strange@example.com", role: "Database Administrator" }
];


async function seedDatabase() {
    try {
        await Project.deleteMany({});
        await Board.deleteMany({});
        await List.deleteMany({});
        await Task.deleteMany({});
        await Member.deleteMany({});
        
        await Project.insertMany(projectsData);
        await Board.insertMany(boardsData);
        await List.insertMany(listsData);
        await Task.insertMany(tasksData);
        await Member.insertMany(membersData);


        console.log("Data successfully seeded!");
        mongoose.connection.close();
    } catch (error) {
        console.error("Error seeding data: ", error);
    }
}

seedDatabase();
