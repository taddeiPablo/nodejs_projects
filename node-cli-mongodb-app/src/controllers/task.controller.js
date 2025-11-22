const Task = require('../models/task');
const { connection } = require('../db');

const addTask = async(task) => {
    await Task.create(task);
    console.log('Task added successfully');
    await connection.close();
}

const tasks_list = async() => {
    const tasks = await Task.find().lean();
    console.table(tasks.map(task => ({
        Id: task._id.toString(),
        title: task.title,
        description: task.description
    })))
    await connection.close();
    process.exit(0);
};

const deleteTask = async(id) => {
    await Task.findByIdAndDelete(id);
    console.log('Task deleted successfully');
    await connection.close();
};

const updateTask = async(id, updatedTask) => {
    await Task.findByIdAndUpdate(id, updatedTask);
    console.log('Task updated successfully');
    await connection.close();
};


module.exports = {
    addTask,
    tasks_list,
    deleteTask,
    updateTask
}