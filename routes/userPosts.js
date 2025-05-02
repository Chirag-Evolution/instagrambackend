const express = require("express");
const router = express.Router();
const {
  create,
  getPost,
  getUserPost,
  likePost,
  unlikePost,
  addComment,
  deletePost,
  myfollowing,
} = require("../controllers/createPost");

router.get("/posts", getPost);

router.post("/add", create);

router.get("/userposts", getUserPost);

router.put("/likes", likePost);

router.put("/unlike", unlikePost);

router.put("/comment", addComment);

router.delete("/deletePost/:id", deletePost);

//router.get("/myfollowingpost", myfollowing);

module.exports = router;
