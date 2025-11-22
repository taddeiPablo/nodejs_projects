const { program } = require("commander");
const inquirer = require("inquirer").default || require("inquirer");
const { addTask, tasks_list, deleteTask, updateTask } = require("./controllers/task.controller");

program.version("1.0.0").description("A CLI application to interact with MongoDB");

const taskQuestion = [
    { 
        type: "input", 
        name: "title", 
        message: "Task title:" 
    },
    {
        type: "input",
        name: "description",
        message: "Description :"
    }
]

program.command("save")
.alias("s")
.action( async () => {
  const answers = await inquirer.prompt(taskQuestion);
  addTask(answers);
});

program.command("list")
.alias("l")
.action(async () => tasks_list());

program.command("delete <id>")
.alias("d")
.action(async (id) => deleteTask(id));

program.command("update <id>")
.alias("u")
.action(async (id) => {
  const answers = await inquirer.prompt(taskQuestion);
  updateTask(id, answers);
});

program.parse(process.argv);