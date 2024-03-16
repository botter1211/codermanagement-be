const express = require("express");
const {
  createTask,
  getAllTasks,
  getSingleTask,
  deleteTaskById,
  updateAssigneeById,
  updateStatusById,
} = require("../controllers/task.controllers");
const router = express.Router();

//Create
/**
 * @route POST api/task
 * @description Create a new task
 * @access private, manager
 * @requiredBody: name, description
 */
router.post("/", createTask);
//Read
/**
 * @route GET api/task
 * @description get list of tasks
 * @access private
 * @allowedQueries: name,status
 */
router.get("/", getAllTasks);
/**
 * @route GET api/tasks/:id
 * @description Get task by id||name
 * @access public
 */
router.get("/:id", getSingleTask);
/**
 * @route DELETE api/tasks/:id
 * @description Delete task by id
 * @access public
 */
router.delete("/:id", deleteTaskById);
/**
 * @route PUT api/tasks/:id
 * @description Update assignee task by id
 * @access public
 */
router.put("/:id/assignee", updateAssigneeById);
/**
 * @route PUT api/tasks/:id
 * @description Update status task by id
 * @access public
 */
router.put("/:id/status", updateStatusById);

module.exports = router;
