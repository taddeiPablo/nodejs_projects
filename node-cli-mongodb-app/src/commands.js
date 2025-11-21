const { program } = require("commander");
const inquirer = require("inquirer").default || require("inquirer");
const { addTask } = require("./controllers/task.controller");

program.version("1.0.0").description("A CLI application to interact with MongoDB");

program.command("save").action( async () => {
  const answers = await inquirer.prompt([
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
  ]);
  addTask(answers);
});

program.parse(process.argv);