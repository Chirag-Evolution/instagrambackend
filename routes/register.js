const express = require("express");
const router = express.Router();
const {
  signup,
  signin,
  follower,
  unfollow,
  getOneUser,
  profile,
} = require("../controllers/signup");
const auth = require("../middlewares/authverify");
router.post("/signup", signup);
router.post("/signin", signin);

router.get("/user/:id", getOneUser);
router.put("/follow", auth, follower);
router.put("/unfollow", auth, unfollow);

router.put("/uploadProfile", auth, profile);
module.exports = router;
