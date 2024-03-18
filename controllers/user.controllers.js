const { sendResponse, AppError } = require("../helpers/utils.js");
const { body, validationResult } = require("express-validator");
const User = require("../models/User.js");

const userController = {};
userController.checkUserValidation = [
  // Validate and sanitize the 'name' field
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isString()
    .withMessage("Name must be a valid string")
    .custom(async (value) => {
      // Check for duplicate names
      const existingUser = await User.findOne({ name: value });
      if (existingUser) {
        throw new Error("User with this name already exists");
      }
      return true;
    }),
  // Validate and sanitize the 'role' field
  body("role")
    .optional()
    .isIn(["employee", "manager"])
    .withMessage("Invalid role value"),
];
//Create a user
userController.createUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const created = await User.create(req.body);
    sendResponse(
      res,
      200,
      true,
      { data: created },
      null,
      "Create User Successfully!"
    );
  } catch (err) {
    next(err);
  }
};

//Get all user
userController.getAllUsers = async (req, res, next) => {
  const filter = {};
  try {
    if (req.query.name) {
      filter.name = { $regex: req.query.name, $options: "i" };
    }
    const listOfFound = await User.find(filter);
    sendResponse(
      res,
      200,
      true,
      { data: listOfFound },
      null,
      "Found list of users successfully!"
    );
  } catch (err) {
    next(err);
  }
};

//Get single user
userController.getSingleUser = async (req, res, next) => {
  try {
    // Extract the user ID from the request parameters
    const userId = req.params.id;

    // Find the user by ID in the database
    const user = await User.findById(userId);

    // If no user is found, send a 404 response
    if (!user) {
      throw new AppError(404, "Not Found", "User not found");
    }

    // Send a 200 response with the user data
    sendResponse(
      res,
      200,
      true,
      { data: user },
      null,
      "Found user successfully!"
    );
  } catch (err) {
    // If an error occurs, pass it to the error handler
    next(err);
  }
};
//export
module.exports = userController;
