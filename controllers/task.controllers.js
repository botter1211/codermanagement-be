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
      return res.status(404).json({ message: "Task not found" });
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
  const taskId = req.params.id;
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

//update assignee
taskController.updateAssigneeById = async (req, res, next) => {
  const taskId = req.params.id;
  //options allow you to modify query. e.g new true return lastest update of data
  const options = { new: true };
  try {
    //mongoose query
    const updated = await Task.findByIdAndUpdate(
      taskId,
      { assignee: req.body.assignee },
      options
    );
    if (!updated) {
      return res.status(404).json({ message: "Task not found" });
    }
    sendResponse(
      res,
      200,
      true,
      { data: updated },
      null,
      "Update assignee successfully!"
    );
  } catch (err) {
    next(err);
  }
};

//update status
taskController.updateStatusById = async (req, res, next) => {
  const taskId = req.params.id;
  const options = { new: true };
  //get status from database

  try {
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    //check status if done && input !== archive
    if (task.status === "done" && req.body.status !== "archive") {
      return res.status(400).json({
        message:
          "Cannot change status from done to another status except archive",
      });
    }
    //if not done => update
    const updated = await Task.findByIdAndUpdate(
      taskId,
      { status: req.body.status },
      options
    );
    sendResponse(
      res,
      200,
      true,
      { data: updated },
      null,
      "Update status successfully!"
    );
  } catch (err) {
    next(err);
  }
};

module.exports = taskController;
