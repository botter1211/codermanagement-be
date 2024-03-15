const { sendResponse, AppError } = require("../helpers/utils.js");
const Task = require("../models/Task.js");

const taskController = {};

//Create a task
taskController.createTask = async (req, res, next) => {
  const info = req.body;
  try {
    if (!info) throw new AppError(402, "Bad Request", "Create Task Error");
    const created = await Task.create(info);
    sendResponse(
      res,
      200,
      true,
      { data: created },
      null,
      "Create Task Successfully!"
    );
  } catch (err) {
    next(err);
  }
};

//Get all task
taskController.getAllTasks = async (req, res, next) => {
  const filter = {};
  try {
    if (req.query.name) {
      filter.name = { $regex: req.query.name, $options: "i" };
    }
    if (req.query.status) {
      filter.status = req.query.status;
    }
    const listOfFound = await Task.find(filter).populate("assignee");
    sendResponse(
      res,
      200,
      true,
      { data: listOfFound },
      null,
      "Found list of tasks successfully!"
    );
  } catch (err) {
    next(err);
  }
};

//Get single task
taskController.getSingleTask = async (req, res, next) => {
  try {
    const taskId = req.params.id;
    const task = await Task.findById(taskId);

    if (!task) {
      throw new AppError(404, "Not Found", "Task not found");
    }
    sendResponse(
      res,
      200,
      true,
      { data: task },
      null,
      "Found task successfully!"
    );
  } catch (err) {
    // If an error occurs, pass it to the error handler
    next(err);
  }
};

//Delete task
taskController.deleteTaskById = async (req, res, next) => {
  //in real project you will getting id from req. For updating and deleting, it is recommended for you to use unique identifier such as _id to avoid duplication

  // empty target mean delete nothing
  const taskId = req.params.id;
  //options allow you to modify query. e.g new true return lastest update of data
  const options = { new: true };
  try {
    //mongoose query
    const updated = await Task.findByIdAndDelete(taskId, options);

    sendResponse(
      res,
      200,
      true,
      { data: updated },
      null,
      "Delete task successfully!"
    );
  } catch (err) {
    next(err);
  }
};
module.exports = taskController;
