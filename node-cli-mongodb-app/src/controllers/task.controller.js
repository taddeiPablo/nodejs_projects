const Task = require('../models/task');
const { connection } = require('../db');

const addTask = async(task) => {
    await Task.create(task);
    console.log('Task added successfully');
    await connection.close();
}

module.exports = {
    addTask
}