const express = require("express");
const {
  createUser,
  getAllUsers,
  getSingleUser,
  checkUserValidation,
} = require("../controllers/user.controllers");
const router = express.Router();

//Create
/**
 * @route POST api/users
 * @description Create a new user
 * @access private, manager
 * @requiredBody: name
 */
router.post("/", checkUserValidation, createUser);
//Read
/**
 * @route GET api/user
 * @description get list of users
 * @access private
 * @allowedQueries: name
 */
router.get("/", getAllUsers);

/**
 * @route GET api/users/:id
 * @description Get user by id
 * @access public
 */
router.get("/:id", getSingleUser);
module.exports = router;
