const { sendResponse, AppError } = require("../helpers/utils.js");
const Task = require("../models/Task.js");
const mongoose = require("mongoose");
const { body, validationResult } = require("express-validator");

const taskController = {};

taskController.checkTaskValidation = [
  // Validate and sanitize the 'name' field
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isString()
    .withMessage("Name must be a valid string"),
  // Validate and sanitize the 'description' field
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isString()
    .withMessage("Description must be a valid string"),
  // Validate 'status' field
  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["pending", "working", "review", "done", "archive"])
    .withMessage("Invalid status value"),
  // Validate 'assignee' field
  body("assignee")
    .optional({ checkFalsy: true }) // This field is optional
    .isMongoId()
    .withMessage("Assignee must be a valid Mongo ID"),
  // Validate 'isDeleted' field
  body("isDeleted")
    .optional() // This field is optional
    .isBoolean()
    .withMessage("isDeleted must be a boolean")
    .toBoolean(), // Convert to boolean
];
//Create a task
taskController.createTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const created = await Task.create(req.body);
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
  const filter = { isDeleted: false };
  try {
    if (req.query.name) {
      filter.name = { $regex: req.query.name, $options: "i" };
    }
    if (req.query.status) {
      filter.status = req.query.status;
    }
    const sort = {};
    if (req.query.sortBy) {
      // Split sortBy into field and order
      const parts = req.query.sortBy.split(":");
      sort[parts[0]] = parts[1] === "desc" ? -1 : 1; // Use -1 for descending, 1 for ascending
    }
    const listOfFound = await Task.find(filter).populate("assignee").sort(sort);
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
    if (!mongoose.isValidObjectId(taskId)) {
      return res.status(400).json({ message: "Invalid ObjectId" });
    }
    const task = await Task.findOne({ _id: taskId, isDeleted: false });

    if (!task) {
      return res.status(404).json({ message: "Task not found or deleted" });
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
    if (!mongoose.isValidObjectId(taskId)) {
      return res.status(400).json({ message: "Invalid ObjectId" });
    }
    const updated = await Task.findByIdAndUpdate(
      taskId,
      { isDeleted: true },
      options
    );

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
  try {
    const taskId = req.params.id;
    const userId = req.body.assignee; // Set to null to unassign

    // Check if taskId and userId are valid ObjectIds
    if (
      !mongoose.isValidObjectId(taskId) ||
      (userId && !mongoose.isValidObjectId(userId))
    ) {
      return res.status(400).json({ message: "Invalid ObjectId" });
    }

    // Find the task by ID and update the assignee
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { assignee: userId },
      { new: true, runValidators: true } // options
    ).populate("assignee");

    // If no task is found, send a 404 response
    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Send a 200 response with the updated task
    res.status(200).json(updatedTask);
  } catch (err) {
    // If an error occurs, send an appropriate response
    res.status(500).json({ message: err.message });
  }
};

//update status
taskController.updateStatusById = async (req, res, next) => {
  const taskId = req.params.id;
  const options = { new: true };
  //get status from database

  try {
    if (!mongoose.isValidObjectId(taskId)) {
      return res.status(400).json({ message: "Invalid ObjectId" });
    }
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

taskController.getAllTasksOfUser = async (req, res, next) => {
  const userId = req.params.userId;
  const filter = { assignee: userId, isDeleted: false };
  if (!mongoose.isValidObjectId(userId)) {
    return res.status(400).json({ message: "Invalid ObjectId" });
  }
  const sort = {};
  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(":");
    sort[parts[0]] = parts[1] === "desc" ? -1 : 1; // Use -1 for descending, 1 for ascending
  }

  try {
    const listOfFound = await Task.find(filter).populate("assignee").sort(sort);
    sendResponse(
      res,
      200,
      true,
      { data: listOfFound },
      null,
      "Found list of tasks successfully!"
    );
  } catch (err) {
    // If an error occurs, pass it to the error handler
    next(err);
  }
};
module.exports = taskController;
