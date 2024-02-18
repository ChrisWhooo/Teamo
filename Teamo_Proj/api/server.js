// api/server.js
const express = require("express")
const bodyParser=require("body-parser");
const app = express();
const cors = require("cors");
const multer = require('multer');
const fs = require('fs'); // Node的文件系统模块，用于删除物理文件
const path = require('path');
const { ActivityLogSchema,ActionTypes} = require('./database/model/ActivityLogSchema');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const lark = require('@larksuiteoapi/node-sdk');

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

const SALT_ROUNDS = 10;
const JWT_SECRET = "232729"; 

const corp_id="ww5dd84cb06e0826ee";
const secret="GYde_P69UUi44Tt_vhwAjB18QQaf_jvUBsl8f--Qz0Y";

// 导入数据库连接代码
require('./database/index');
const Project = require('./database/model/Project');
const Board = require('./database/model/Board');
const List = require('./database/model/List');
const Task = require('./database/model/Task');
const Member = require('./database/model/Member');
const User = require('./database/model/User');
const BoardMember = require('./database/model/BoardMember');
const Bug = require('./database/model/Bug');
const BugGroup = require('./database/model/BugGroup');
const Todo = require('./database/model/ToDo');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'C:/Users/admin/Teamo_Proj/client/src/uploads');
  },
  filename: function (req, file, cb) {
    const encodedFilename = new Date().toISOString().replace(/:/g, '-') + '-' + encodeURIComponent(file.originalname);
    // 使用原始文件名作为属性存储
    file.encodedFilename = encodedFilename;
    file.originalFilename = file.originalname; 
    cb(null, encodedFilename);
  }
});

const upload = multer({ storage: storage });

app.get('/uploads/:filename', (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join('C:/Users/admin/Teamo_Proj/client/src/uploads', filename);

  res.setHeader('Content-Disposition', 'attachment; filename=' + filename);
  res.download(filepath, filename);
});


//注册接口
app.post('/api/users/register', async (req, res) => {
  try {
      const { email, username, password } = req.body;

      // 检查用户名是否已存在
      const existingUser = await User.findOne({ username });
      if (existingUser) {
          return res.status(400).send("用户名已存在");
      }

      const existingUserByEmail = await User.findOne({ email });
      if (existingUserByEmail) {
          return res.status(400).send("电子邮件已被注册");
      }

      // 直接保存明文密码
      const newUser = new User({
          username,
          password,
          email
      });

      await newUser.save();
      res.status(201).json(newUser);
  } catch (err) {
      res.status(500).send(err.message);
  }
});

//登录接口
app.post('/api/users/login', async (req, res) => {
  try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
          return res.status(400).send("邮箱不存在");
      }

      // 直接比较明文密码
      if (user.password !== password) {
          return res.status(401).send("密码错误");
      }

      // 发放JWT
      const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, {
          expiresIn: "1h"
      });

      res.json({ token, user });
  } catch (err) {
      res.status(500).send(err.message);
  }
});



  //Mongodb数据库
  app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.get('/api/users/:userId', async (req, res) => {
  try {
      const user = await User.findById(req.params.userId);
      if (user) {
          res.json(user);
      } else {
          res.status(404).send('未找到匹配的用户');
      }
  } catch (err) {
      res.status(500).send(err.message);
  }
});

  app.get('/api/projects_data', async (req, res) => {
    try {
      const projects = await Project.find();
      res.json(projects);
    } catch (err) {
      res.status(500).send(err.message);
    }
  });
  
  app.get('/api/boards_data',async(req,res)=>{
    try{

      const query = {};

        // 如果有name查询参数，则添加到查询对象中
        if (req.query.name) {
            query.name = new RegExp(req.query.name, 'i');  // 'i' 使查询不区分大小写
        }

      const boards = await Board.find();
      res.json(boards);
    }catch(err){
      res.status(500).send(err.message);
    }
  });
//根据用户id获取看板
app.get('/api/user_boards', async (req, res) => {
  try {
    const userId = req.query.userId;

    // 首先，根据用户ID查找他是所有者或被邀请者的所有看板
    const boardMembers = await BoardMember.find({ userId });

    console.log(boardMembers);

    // 提取这些看板的ID
    const boardIds = boardMembers.map(bm => bm.boardId);

    // 然后，根据这些ID获取具体的看板信息
    const allBoards = await Board.find({ _id: { $in: boardIds } });

    console.log(allBoards);
    // 使用 boardRole 区分我创建的和我被邀请的看板
    const myCreatedBoards = boardMembers
      .filter(bm => bm.boardRole === 'OWNER')
      .map(bm => allBoards.find(board => board._id.toString() === bm.boardId.toString()));

    console.log(myCreatedBoards);

    const invitedBoards = boardMembers
      .filter(bm => bm.boardRole === 'INVITED')
      .map(bm => allBoards.find(board => board._id.toString() === bm.boardId.toString()));

    res.json({
      created: myCreatedBoards,
      invited: invitedBoards
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// 根据看板id获取成员
app.get('/api/board_members', async (req, res) => {
  try {
      const boardId = req.query.boardId;
      const boardMembers = await BoardMember.find({ boardId: boardId }).populate('userId');
      
      
      res.json(boardMembers);
  } catch (err) {
      res.status(500).send(err.message);
  }
});

  app.get('/api/lists_data',async(req,res)=>{
    try{
      const lists = await List.find();
      res.json(lists);
    }catch(err){
      res.status(500).send(err.message);
    }
  });
  app.get('/api/tasks_data',async(req,res)=>{
    try{
      const tasks = await Task.find();
      res.json(tasks);
    }catch(err){
      res.status(500).send(err.message);
    }
  });
  app.get('/api/members_data', async (req, res) => {
    try {
        const members = await Member.find();
        res.json(members);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

  app.get('/api/projects_data/:projectId', async (req, res) => {
    const projectIdToFind = parseInt(req.params.projectId);
    try {
        const foundProject = await Project.find({ id: projectIdToFind });
        if (foundProject.length) {
            res.json(foundProject);
        } else {
            res.status(404).json({ error: '未找到匹配的项目' });
        }
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.get('/api/boards_data/:boardId', async (req, res) => {
  try {
      const foundBoard = await Board.find({ _id: req.params.boardId });
      if (foundBoard.length) {
          res.json(foundBoard);
      } else {
          res.status(404).json({ error: '未找到匹配的看板' });
      }
  } catch (err) {
      res.status(500).send(err.message);
  }
});

app.get('/api/lists_data/:boardId', async (req, res) => {
  
  try {
      const foundLists = await List.find({ boardId: req.params.boardId });
      if (foundLists.length) {
          res.json(foundLists);
      } else {
          res.status(404).send('未找到匹配列表');
      }
  } catch (err) {
      res.status(500).send(err.message);
  }
});

app.get('/api/tasks/:username', async (req, res) => {
  const username = req.params.username;

  try {
      // Fetch tasks created by the user
      const createdTasks = await Task.find({ createdBy: username }).exec();

      // Fetch tasks assigned to the user
      const assignedTasks = await Task.find({ assignedTo: username }).exec();

      const getSubtasks = async (task) => {
        const subTasks = await Task.find({ parentTask: task._id }).populate('parentTask').exec();
        console.log('Retrieved subtasks:', subTasks);
        const subTaskTitles = subTasks.map(st => st.title);
        console.log('Mapped subtask titles:', subTaskTitles);
        return subTaskTitles;
    };
    
    

      for (let task of createdTasks) {
          task.subTasksTitle = await getSubtasks(task);
          console.log('子任务:',task);
      }

      for (let task of assignedTasks) {
          task.subTasksTitle = await getSubtasks(task);
      }

      // Send the tasks to the client
      res.json({
          createdTasks: createdTasks,
          assignedTasks: assignedTasks
      });
  } catch (error) {
      res.status(500).send({ error: 'Server Error' });
  }
});


app.get('/api/tasks_data/:listId', async (req, res) => {
  const listIdToFind = parseInt(req.params.listId,10);
  try {
      const foundTasks = await Task.find({ listId: listIdToFind });
      res.json(foundTasks);
  } catch (err) {
      res.status(500).send(err.message);
  }
});

app.get('/api/tasks/:taskId/comments', async (req, res) => {
  try {
      const task = await Task.findOne({ _id: req.params.taskId });
      if (task) {
          res.status(200).json(task.comments);
      } else {
          res.status(404).json({ error: "Task not found." });
      }
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

app.get('/api/members/:memberId', async (req, res) => {
  try {
      const member = await Member.findOne({ id: req.params.memberId });
      if (member) {
          res.json(member);
      } else {
          res.status(404).send('未找到匹配的成员');
      }
  } catch (err) {
      res.status(500).send(err.message);
  }
});
//获取日志
app.get('/api/tasks/:taskId/activities', async (req, res) => {
  try {
      const task = await Task.findOne({ _id: req.params.taskId }).select('activities');

      if (task && task.activities && task.activities.length > 0) {
          res.json(task.activities);
      } else {
          res.status(404).send('未找到匹配的活动日志');
      }
  } catch (err) {
      res.status(500).send(err.message);
  }
});
//获取bug列表
// 获取特定用户创建的Bug
app.get("/api/bugGroups/user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    // 查询所有 bug 组，包括关联的创建者用户信息
    const bugGroups = await BugGroup.find({
      $or: [{ createdBy: userId }, { accessibleUsers: userId }],
    })
      .populate("createdBy", "username") // 使用 populate 方法，仅选择用户名字段
      .lean()
      .exec();

    const allBugs = await Bug.find({
      "createdBy.userId": userId,
    })
      .populate({
        path: "createdBy.userId",
        select: "username",
      })
      .lean()
      .exec();

    bugGroups.forEach((group) => {
      group.bugs = allBugs.filter(
        (bug) => bug.groupId.toString() === group._id.toString()
      );
    });

    res.status(200).json(bugGroups);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});


app.get("/api/bugs/:id", async (req, res) => {
  try {
      const bug = await Bug.findById(req.params.id).populate('groupId');
      if (!bug) {
          return res.status(404).json({ message: "Bug not found" });
      }
      res.status(200).json(bug);
  } catch (error) {
      res.status(500).json({ message: "Server Error" });
  }
});


app.post('/api/users', async (req, res) => {
  try {
      const newUser = new User(req.body);
      await newUser.save();
      res.status(201).json(newUser);
  } catch (err) {
      res.status(500).send(err.message);
  }
});

// 添加一个项目
app.post('/api/projects_data', async (req, res) => {
  try {
      const newProject = new Project(req.body);
      await newProject.save();
      res.status(201).json(newProject);
  } catch (err) {
      res.status(500).send(err.message);
  }
});

app.get('/api/boardmembers', async (req, res) => {
  try {
      const boardMembers = await BoardMember.find(); 

      if (!boardMembers || boardMembers.length === 0) {
          return res.status(404).send('No board members found.');
      }

      res.status(200).json(boardMembers);
  } catch (err) {
      res.status(500).send(err.message);
  }
});

// 添加一个看板
app.post('/api/boards_data', async (req, res) => {
  try {
      req.body.createdBy = req.body.createdBy ;

      const newBoard = new Board(req.body);

      // 在保存前为 link 属性分配值
      newBoard.link = `/boards/${newBoard._id}`;
      await newBoard.save();

       // 为创建者分配 OWNER 角色
      const newBoardMember = new BoardMember({
        boardId: newBoard._id,
        userId: newBoard.creatorId,
        boardRole: 'OWNER'
      });

      await newBoardMember.save();

   
      // const responseData = {
      //   ...newBoard._doc,
      //   link: `/boards/${newBoard._id}`
      // };

      res.status(201).json(newBoard);
  } catch (err) {
      res.status(500).send(err.message);
  }
});
//邀请成员到看板
app.post('/api/invite_to_board', async (req, res) => {
  try {
      const { board_Id, inviteeUserId, inviter } = req.body;

      // console.log(board_Id,inviter._id);
      // const boardOwner_test = await BoardMember.findOne({ boardId:board_Id, userId: inviter._id, boardRole: 'OWNER' });
      // console.log(boardOwner_test);
      // 确认邀请者是该看板的OWNER
      const boardOwner = await BoardMember.findOne({ boardId:board_Id, userId: inviter._id, boardRole: 'OWNER' });

      if (!boardOwner) {
          return res.status(403).send('仅看板所有者能够邀请成员');
      }

      // 检查是否已经邀请过该用户
      const existingInvitation = await BoardMember.findOne({ boardId:board_Id, userId: inviteeUserId });
      if (existingInvitation) {
          return res.status(400).send('该成员已被邀请');
      }

      const newInvitation = new BoardMember({
          boardId:board_Id,
          userId: inviteeUserId,
          boardRole: 'INVITED'
      });

      await newInvitation.save();

      res.status(201).send('Invitation sent successfully.');
  } catch (err) {
      res.status(500).send(err.message);
  }
});

// 添加一个列表
app.post('/api/lists_data', async (req, res) => {
  try {
      const newList = new List(req.body);
      await newList.save();
      res.status(201).json(newList);
  } catch (err) {
      res.status(500).send(err.message);
  }
});

// 添加一个任务
app.post('/api/tasks_data', async (req, res) => {
  try {
    if (!Array.isArray(req.body.comments)) {
      req.body.comments = [];
    }

    // 创建新任务并保存
    const newTask = new Task(req.body);
    await newTask.save();

    // 如果有parentTask属性，更新主任务的subTasks
    if (newTask.parentTask) {
      const parentTask = await Task.findById(newTask.parentTask);
      if (parentTask) {
        parentTask.subTasks.push(newTask._id);
        await parentTask.save();
      }
    }

    res.status(201).json(newTask);
  } catch (err) {
    res.status(500).send(err.message);
  }
});


app.get('/api/tasks/:taskId/subtasks', async (req, res) => {
  try {
      const subTasks = await Task.find({ parentTask: req.params.taskId });
      res.status(200).json(subTasks);
  } catch (err) {
      res.status(500).send(err.message);
  }
});


app.post('/api/tasks/:taskId/add-comments', async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.taskId });
      task.comments.push({
          content: req.body.content,
          author: req.body.author
      });
      await task.save();
      res.status(200).json(task);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

app.post('/api/members', async (req, res) => {
  try {
      const newMember = new Member(req.body);
      await newMember.save();
      res.status(201).json(newMember);
  } catch (err) {
      res.status(500).send(err.message);
  }
});
//添加附件
app.post('/api/tasks/:taskId/add-attachment', upload.single('file'), async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.taskId });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // 从multer中获取文件信息
    const file = req.file;

    task.attachments.push({
      originalName: file.originalFilename,  // 保存原始文件名
      encodedName: file.encodedFilename, 
      url: '/uploads/' + file.filename,
      fileType: file.mimetype
    });

    await task.save();
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
//为特定任务添加新活动
app.post('/api/tasks/:taskId/activities', async (req, res) => {
  try {
      console.log("Received request body:", req.body);

      const task = await Task.findOne({ _id: req.params.taskId });
      if (!task) {
          return res.status(404).json({ error: "Task not found." });
      }

      // 检查传入的活动类型是否为有效类型
      if (!Object.values(ActionTypes).includes(req.body.type)) {
          return res.status(400).json({ error: "Invalid activity type." });
      }

      const newActivity = {
          action: req.body.type,  // 注意这里是action而不是type
          user: req.body.user,
          details: req.body.details  // 这里可能需要进一步验证子字段的存在和有效性
      };


      console.log('添加日志前：',task.activities);
      task.activities.push(newActivity);
      console.log('添加日志后：',task.activities)
      task.markModified('activities');
      await task.save();

      res.status(201).json(newActivity);

  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});
//添加bug
app.post("/api/bugs", async (req, res) => {
  try {
    // 解构请求体中的 createdBy 对象
    const { _id, username } = req.body.createdBy;
    
    // 创建一个包含完整 createdBy 信息的新对象
    const createdBy = {
      userId: _id, // 这里使用新的结构
      username,
    };

    // 创建 Bug 文档
    const bug = new Bug({
      ...req.body,
      createdBy, // 使用新的 createdBy 对象
    });

    await bug.validate();
    await bug.save();

    // 使用 populate 填充 createdBy 字段
    const populatedBug = await Bug.populate(bug, {
      path: 'createdBy.userId',
      select: 'username', // 只选择 username 字段
    });

    res.status(201).json(populatedBug);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

app.post("/api/bugGroups", async (req, res) => {
  try {
    // 解构请求体中的 createdBy 对象
    const { _id, username } = req.body.createdBy;
    
    // 创建一个包含完整 createdBy 信息的新对象
    const createdBy = {
      _id,
      username,
    };

    // 创建 BugGroup 文档
    const group = new BugGroup({
      ...req.body,
      createdBy, // 使用新的 createdBy 对象
    });

    await group.save();

    // 使用 populate 填充 createdBy 字段
    const populatedGroup = await BugGroup.populate(group, {
      path: 'createdBy',
      select: 'username', // 只选择 username 字段
    });

    res.status(201).json(populatedGroup);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// POST请求用于邀请用户加入 BugGroup
app.post('/api/:groupId/invite', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId, username } = req.body; // 添加用户名字段

    // 查找 BugGroup
    const bugGroup = await BugGroup.findById(groupId);

    if (!bugGroup) {
      return res.status(404).json({ message: 'BugGroup not found' });
    }

    // 检查要邀请的用户是否已经在 accessibleUsers 中
    if (bugGroup.accessibleUsers.includes(userId)) {
      return res.status(400).json({ message: 'User already invited' });
    }

    // 添加被邀请用户的 ID 到 accessibleUsers 中
    bugGroup.accessibleUsers.push(userId); // 只添加 userId
    await bugGroup.save();

    res.status(200).json({ message: 'Invitation sent successfully' });
  } catch (error) {
    console.error('Error inviting user:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});


app.put('/api/bugs/assign', async (req, res) => {
  try {
    const { bugIds, assignedTo } = req.body;

    // 查询指定的多个 bug 记录
    const bugs = await Bug.find({ _id: { $in: bugIds } });

    if (!bugs || bugs.length === 0) {
      return res.status(404).json({ message: 'Bugs not found' });
    }

    // 更新所有 bug 记录的负责人字段
    bugs.forEach(async (bug) => {
      bug.assignedTo = assignedTo;
      await bug.save();
    });

    res.status(200).json({ message: 'Bugs 已成功分配给负责人' });
  } catch (error) {
    console.error('Error assigning bugs:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});




// 获取当前用户的所有待办事项
app.get('/api/todos', async (req, res) => {
  try {
      const userId = req.query.userId; // 从查询参数中获取用户ID
      if (!userId) {
          return res.status(400).json({ message: "UserId is required" });
      }
      const todos = await Todo.find({ userId: userId });
      res.json(todos);
  } catch (err) {
      res.status(500).json({ message: err.message });
  }
});


app.post('/api/todos/addFromReference', async (req, res) => {
  try {
      const { type, refId, user } = req.body;
      console.log(refId);

      let referenceData;
      if (type === 'task') {
          referenceData = await Task.findById(refId);
      } else if (type === 'bug') {
          referenceData = await Bug.findById(refId);
      }

      console.log(referenceData);

      if (!referenceData) {
          return res.status(404).send({ error: `${type} not found` });
      }

      const newTodoData = {
          title: referenceData.title,
          description: referenceData.description,
          createdBy: user.username,
          type: type,
          refId: refId,
          userId: user._id,
          assignedTo: referenceData.assignedTo
      };

      // 根据类型设置relatedTaskId或relatedBugId
      if (type === 'task') {
          newTodoData.relatedTaskId = refId;
      } else if (type === 'bug') {
          newTodoData.relatedBugId = refId;
      }

      const newTodo = new Todo(newTodoData);
      console.log(newTodo);

      await newTodo.save();
      res.status(201).json(newTodo);
  } catch (err) {
      res.status(500).send({ error: err.message });
  }
});


// 更新待办事项
app.put('/api/todos/:id', async (req, res) => {
  try {
      const { userId, completed, solution } = req.body;

      console.log("Searching for Todo with ID:", req.params.id, "and userId:", userId);
      console.log(req.body);

      const updatedTodo = await Todo.findOneAndUpdate(
          { _id: req.params.id, userId: userId }, 
          req.body, 
          { new: true }
      );

      if (!updatedTodo) {
          return res.status(404).json({ message: 'Todo not found' });
      }

      if (completed) {
          if (updatedTodo.type === 'task') {
              await Task.findByIdAndUpdate(updatedTodo.relatedTaskId, { status: '已完成' });
          } else if (updatedTodo.type === 'bug') {
              await Bug.findByIdAndUpdate(updatedTodo.relatedBugId, { status: 'Closed' });
          }
      }

      // 如果Todo有解决方案，将其添加到对应的Task或Bug的solution中
      if (solution && solution.length > 0) {
        if (updatedTodo.type === 'task') {
            const task = await Task.findById(updatedTodo.relatedTaskId);
            task.solution.push(...solution);
            await task.save();
        } else if (updatedTodo.type === 'bug') {
            const bug = await Bug.findById(updatedTodo.relatedBugId);
            bug.solution.push(...solution);
            await bug.save();
        }
    }

      res.json(updatedTodo);
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
  }
});


// 删除待办事项
app.delete('/api/todos/:id', async (req, res) => {
  try {
      const deletedTodo = await Todo.findOneAndDelete({ _id: req.params.id});
      if (!deletedTodo) {
          return res.status(404).json({ message: 'Todo not found' });
      }
      res.json(deletedTodo);
  } catch (err) {
      res.status(500).json({ message: err.message });
  }
});

app.put('/api/users/:userId', async (req, res) => {
  try {
      const updatedUser = await User.findOneAndUpdate({ id: req.params.userId }, req.body, { new: true });
      if (!updatedUser) res.status(404).send("用户未找到");
      res.json(updatedUser);
  } catch (err) {
      res.status(500).send(err.message);
  }
});


// 修改一个项目
app.put('/api/projects_data/:projectId', async (req, res) => {
  try {
      const updatedProject = await Project.findOneAndUpdate(req.params.projectId, req.body, { new: true });
      if (!updatedProject) res.status(404).send("项目未找到");
      res.json(updatedProject);
  } catch (err) {
      res.status(500).send(err.message);
  }
});

// 修改一个看板
app.put('/api/boards_data/:boardId', async (req, res) => {
  try {
      const updatedBoard = await Board.findOneAndUpdate({ _id: req.params.boardId }, req.body, { new: true });
      if (!updatedBoard) res.status(404).send("看板未找到");
      res.json(updatedBoard);
  } catch (err) {
      res.status(500).send(err.message);
  }
});


// 修改一个列表
app.put('/api/lists_data/:listId', async (req, res) => {
  try {
    const listId = Number(req.params.listId);  // Convert to number if it's sent as a string

    const updatedList = await List.findOneAndUpdate({ id: listId }, req.body, { new: true });

    if (!updatedList) {
      return res.status(404).send("列表未找到");
    }

    res.json(updatedList);

  } catch (err) {
    res.status(500).send(err.message);
  }
});




// 修改一个任务
app.put('/api/tasks_data/:taskId', async (req, res) => {
  try {
    const { board_Id, requestor } = req.body;

    console.log(board_Id && requestor);

    if (board_Id && requestor) {
      const boardOwner = await BoardMember.findOne({ boardId: board_Id, userId: requestor._id, boardRole: 'OWNER' });

      if (!boardOwner) {
          return res.status(403).send('只有看板所有者才能修改任务');
      }
    }

    const updatedTask = await Task.findOneAndUpdate({ _id: req.params.taskId }, req.body, { new: true });
    res.json(updatedTask);
  } catch (err) {
    res.status(500).send(err.message);
  }
});



app.put('/api/members/:memberId', async (req, res) => {
  try {
      const updatedMember = await Member.findOneAndUpdate({ _id: req.params.memberId }, req.body, { new: true });
      if (updatedMember) {
          res.json(updatedMember);
      } else {
          res.status(404).send('未找到匹配的成员');
      }
  } catch (err) {
      res.status(500).send(err.message);
  }0
});
//修改bug
app.put("/api/bugs/:id", async (req, res) => {
  try {
      const bug = await Bug.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!bug) {
          return res.status(404).json({ message: "Bug not found" });
      }
      res.status(200).json(bug);
  } catch (error) {
      res.status(500).json({ message: "Server Error" });
  }
});
app.put("/api/bugGroups/:id", async (req, res) => {
  try {
      const group = await BugGroup.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!group) {
          return res.status(404).json({ message: "Group not found" });
      }
      res.status(200).json(group);
  } catch (error) {
      res.status(500).json({ message: "Server Error" });
  }
});


app.delete('/api/users/:userId', async (req, res) => {
  try {
      const user = await User.findOne({ id: req.params.userId });
      if (!user) {
          return res.status(404).send("用户未找到");
      }
      await user.remove();
      res.status(200).send("用户删除成功");
  } catch (err) {
      res.status(500).send(err.message);
  }
});


// 删除一个项目
app.delete('/api/projects_data/:projectId', async (req, res) => {
  try {
      const deletedProject = await Project.findOneAndRemove(req.params.projectId);
      if (!deletedProject) res.status(404).send("项目未找到");
      res.status(204).send();
  } catch (err) {
      res.status(500).send(err.message);
  }
});

// 删除一个看板
app.delete('/api/boards_data/:boardId', async (req, res) => {
  try {
      const deletedBoard = await Board.findOneAndRemove({ _id: req.params.boardId });
      if (!deletedBoard) res.status(404).send("看板未找到");
      res.status(204).send();
  } catch (err) {
      res.status(500).send(err.message);
  }
});


// 删除一个列表
app.delete('/api/lists_data/:listId', async (req, res) => {
  try {
      const deletedList = await List.findOneAndRemove({ id: req.params.listId });
      if (!deletedList) res.status(404).send("列表未找到");
      res.status(204).send();
  } catch (err) {
      res.status(500).send(err.message);
  }
});

// 删除一个任务
app.delete('/api/tasks_data/:taskId', async (req, res) => {
  try {
    const { board_Id, requestor } = req.body;

    // 确认请求者是看板的所有者
    if (board_Id && requestor) {
      const boardOwner = await BoardMember.findOne({ boardId: board_Id, userId: requestor._id, boardRole: 'OWNER' });

      if (!boardOwner) {
          return res.status(403).send('只有看板所有者才能删除任务');
      }
    }

    const task = await Task.findById({ _id: req.params.taskId });
    if (!task) {
        return res.status(404).send('Task not found');
    }

    // 如果是主任务，先删除所有子任务
    if (!task.parentTask) {
        await Task.deleteMany({ parentTask: task._id });
    }

    await Task.deleteOne({ _id: req.params.taskId });
    res.status(200).send('Task deleted successfully');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.delete('/api/tasks/:taskId/comments/:commentId', async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.taskId });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    const commentIndex = task.comments.findIndex(comment => comment._id.toString() === req.params.commentId);
    if (commentIndex === -1) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    task.comments.splice(commentIndex, 1);
    await task.save();
    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/members/:memberId', async (req, res) => {
  try {
      const deletedMember = await Member.findOneAndRemove({ id: req.params.memberId });
      if (deletedMember) {
          res.status(204).send();
      } else {
          res.status(404).send('未找到匹配的成员');
      }
  } catch (err) {
      res.status(500).send(err.message);
  }
});

// 移除看板成员
app.delete('/api/remove_from_board', async (req, res) => {
  try {
      const { board_Id, userIdToRemove, requestor } = req.body;

      // 确认请求者是该看板的OWNER
      const boardOwner = await BoardMember.findOne({ boardId: board_Id, userId: requestor, boardRole: 'OWNER' });

      if (!boardOwner) {
          return res.status(403).send('仅看板所有者能够移除成员');
      }

      // 找到并删除成员
      const memberToRemove = await BoardMember.findOneAndDelete({ boardId: board_Id, userId: userIdToRemove });

      if (!memberToRemove) {
          return res.status(400).send('成员不存在或已被移除');
      }

      res.status(200).send('成员已成功移除');

  } catch (err) {
      res.status(500).send(err.message);
  }
});


//删除附件
app.delete('/api/tasks/:taskId/attachments/:attachmentId', async (req, res) => {
  try {
    // 使用 _id 查找任务
    const task = await Task.findOne({ _id: req.params.taskId });

    if (!task) {
      return res.status(404).json({ error: '任务未找到' });
    }

    // 使用 _id 查找附件
    const attachmentIndex = task.attachments.findIndex(att => att._id.toString() === req.params.attachmentId);
    if (attachmentIndex === -1) {
      return res.status(404).json({ error: '附件未找到' });
    }

    // 如果附件保存在文件系统上，删除它
    const attachment = task.attachments[attachmentIndex];
    
    const filePath = path.join(__dirname, attachment.url);  // 使用附件的url来确定文件路径
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // 从任务中删除附件
    task.attachments.splice(attachmentIndex, 1);
    await task.save();

    res.status(200).json({ message: '附件已成功删除' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
//删除bug
app.delete("/api/bugs/:id", async (req, res) => {
  try {
      const bug = await Bug.findByIdAndRemove(req.params.id);
      if (!bug) {
          return res.status(404).json({ message: "Bug not found" });
      }
      res.status(200).json({ message: "Bug deleted successfully" });
  } catch (error) {
      res.status(500).json({ message: "Server Error" });
  }
});
app.delete("/api/bugGroups/:id", async (req, res) => {
  try {
      const group = await BugGroup.findByIdAndRemove(req.params.id);
      if (!group) {
          return res.status(404).json({ message: "Group not found" });
      }
      res.status(200).json({ message: "Group deleted successfully" });
  } catch (error) {
      res.status(500).json({ message: "Server Error" });
  }
});


app.listen(3002, () => {
  console.log("app listening on port 3002")
})
