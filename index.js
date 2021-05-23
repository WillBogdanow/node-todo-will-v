const db = require("./db.js");
const inquirer = require("inquirer");

module.exports.add = async (title) => {
  //讀取之前的任務
  const list = await db.read();
  //往裡面添加一個title任務
  list.push({ title, done: false });
  //存儲任務到文件
  db.write(list);
};

module.exports.clear = async (title) => {
  await db.write([]);
};
function markAsDone(list, index) {
  list[index].done = true;
  db.write(list);
}
function markAsUndone(list, index) {
  list[index].done = false;
  db.write(list);
}
function updateTitle(list, index) {
  inquirer
    .prompt({
      type: "input",
      name: "title",
      message: "NewTitle",
      default: list[index].title,
    })
    .then((answer) => {
      list[index].title = answer.title;
      db.write(list);
    });
}
function remove(list, index) {
  list.splice(index, 1);
  db.write(list);
}
function askForAction(list, index) {
  const actions = { markAsDone, markAsUndone, updateTitle, remove };
  inquirer
    .prompt({
      type: "list",
      name: "action",
      message: "NowWhat",
      choices: [
        { name: "Exit", value: "quit" },
        { name: "Done", value: "markAsDone" },
        { name: "incomplete", value: "markAsUndone" },
        { name: "Title", value: "updateTitle" },
        { name: "Delete", value: "remove" },
      ],
    })
    .then((answer2) => {
      const action = actions[answer2.action];
      action && action(list, index);
    });
}
function askForCreateTask(list) {
  inquirer
    .prompt({
      type: "input",
      name: "title",
      message: "input your want",
    })
    .then((answer) => {
      list.push({
        title: answer.title,
        done: false,
      });
      db.write(list);
    });
}
function printTasks(list) {
  inquirer
    .prompt({
      type: "list",
      name: "index",
      message: "What do you want to do?",
      choices: [
        { name: "Out", value: "-1" },
        ...list.map((task, index) => {
          return {
            name: `${task.done ? "[x]" : "[_]"} ${index + 1} - ${task.title}`,
            value: index.toString(),
          };
        }),
        { name: "NewOrders", value: "-2" },
      ],
    })
    .then((answer) => {
      const index = parseInt(answer.index);
      if (index >= 0) {
        askForAction(list, index);
      } else if (index === -2) {
        askForCreateTask(list);
      }
    });
}
module.exports.showAll = async () => {
  //讀取之前的任務
  const list = await db.read();
  //打印之前的任務
  printTasks(list);
};
