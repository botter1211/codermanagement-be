const express = require("express");
const router = express.Router();

//Create
/**
 * @route POST api/users
 * @description Create a new user
 * @access private, manager
 * @requiredBody: name
 */
router.post("/", createUser);
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
module.exports = router;
