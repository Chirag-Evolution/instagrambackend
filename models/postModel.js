const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  body: {
    type: String,
    required: true,
  },
  photo: {
    type: String,
  },
  postedby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "userModel",
  },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "userModel" }],
  comments: [
    {
      comment: { type: String, required: true },
      postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "userModel" },
    },
  ],
});

module.exports = mongoose.model("postModel", postSchema);
