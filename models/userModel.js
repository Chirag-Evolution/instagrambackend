const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    require: true,
  },
  uname: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  profilePhoto: {
    type: String,
  },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "userModel" }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: "userModel" }],
});
module.exports = mongoose.model("userModel", userSchema);
