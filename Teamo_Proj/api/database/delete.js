const List = require('./model/List'); // 假设你的List模型在'models/list.js'中
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/database', { useNewUrlParser: true, useUnifiedTopology: true });

const deleteNonNumericIds = async () => {
    try {
      await List.deleteMany({ id: { $not: { $type: 'number' } } });
      console.log('Lists deleted successfully');
    } catch (err) {
      console.error('Error deleting lists:', err);
    } finally {
      mongoose.connection.close();
    }
  };
  
  deleteNonNumericIds();