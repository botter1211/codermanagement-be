const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  role: {
    type: String,
    enum: ["employee", "manager"],
  },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
