const { sendResponse, AppError } = require("../helpers/utils.js");
const User = require("../models/User.js");

const userController = {};

//Create a user
userController.createUser = async (req, res, next) => {
  //in real project you will getting info from req
  const info = {
    name: "Terror",
    role: "manager",
  };
  try {
    //always remember to control your inputs
    if (!info) throw new AppError(402, "Bad Request", "Create User Error");
    //mongoose query
    const created = await User.create(info);
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

//export
module.exports = userController;
