const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const postModel = require("../models/postModel");
const signup = async (req, res) => {
  let data = req.body;

  let userAvailableData = await userModel.findOne({
    $or: [
      {
        email: data.email,
      },
      { uname: data.uname },
    ],
  });
  if (userAvailableData) {
    return res.send({
      message: "User is Already Registed,Try with different email",
    });
  }

  try {
    let hashpassword = await bcrypt.hash(data.password, 10);
    let user = await userModel.create({
      name: data.name,
      email: data.email,
      uname: data.uname,
      password: hashpassword,
    });
    if (user) {
      res.send({ message: "Registered Successfully" });
    } else {
      res.send({ message: "Error in Registration, Try Again Later" });
    }
  } catch (err) {
    res.send({ message: "Error in Registration, Try Again Later", err });
  }
};

const signin = async (req, res) => {
  let user = await userModel.findOne({ email: req.body.email });
  if (!user) {
    return res.json({ msg: "User Not Found" });
  }
  try {
    if (user) {
      bcrypt.compare(req.body.password, user.password, function (err, result) {
        if (result) {
          var token = jwt.sign({ user }, "key");
          return res.json({
            msg: "log in",
            result: result,
            token: token,
            user: user,
          });
        } else {
          return res.json({ msg: "Invalid Credential", result: result });
        }
      });
    }
  } catch (err) {
    res.send({ msg: "Invalid", result: err });
  }
};

// const follower = (req, res) => {
//   userModel.findByIdAndUpdate(
//     req.body.followId,
//     {
//       $push: { followers: req.user.user._id },
//     },
//     { new: true },
//     (err, result) => {
//       if (err) {
//         return res.status.json({ error: err });
//       }
//       userModel
//         .findByIdAndUpdate(
//           req.user.user._id,
//           {
//             $push: { following: req.body.followId },
//           },
//           {
//             new: true,
//           }
//         )
//         .then((result) => res.json(result))
//         .catch((err) => res.json(err));
//     }
//   );
// };

const follower = async (req, res) => {
  try {
    // Add current user to the followers of the target user
    const updatedFollowedUser = await userModel.findByIdAndUpdate(
      req.body.followId,
      {
        $push: { followers: req.user.user._id },
      },
      { new: true }
    );

    // Add the followed user to the current user's following list
    const updatedCurrentUser = await userModel.findByIdAndUpdate(
      req.user.user._id,
      {
        $push: { following: req.body.followId },
      },
      { new: true }
    );

    res.status(200).json({
      message: "Follow successful",
      updatedFollowedUser,
      updatedCurrentUser,
    });
  } catch (error) {
    console.error("Follow error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// const unfollow = (req, res) => {
//   userModel.findByIdAndUpdate(
//     req.body.followId,
//     {
//       $pull: { followers: req.user.user._id },
//     },
//     { new: true },
//     (err, result) => {
//       if (err) {
//         return res.status.json({ error: err });
//       }
//       userModel
//         .findByIdAndUpdate(
//           req.user.user._id,
//           {
//             $pull: { following: req.body.followId },
//           },
//           {
//             new: true,
//           }
//         )
//         .then((result) => res.json(result))
//         .catch((err) => res.json(err));
//     }
//   );
// };

const unfollow = async (req, res) => {
  try {
    // Remove current user from the followers of the target user
    const updatedUnfollowedUser = await userModel.findByIdAndUpdate(
      req.body.followId,
      {
        $pull: { followers: req.user.user._id },
      },
      { new: true }
    );

    // Remove the target user from the current user's following list
    const updatedCurrentUser = await userModel.findByIdAndUpdate(
      req.user.user._id,
      {
        $pull: { following: req.body.followId },
      },
      { new: true }
    );

    res.status(200).json({
      message: "Unfollow successful",
      updatedUnfollowedUser,
      updatedCurrentUser,
    });
  } catch (error) {
    console.error("Unfollow error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getOneUser = async (req, res) => {
  const user = await userModel
    .findOne({ _id: req.params.id })
    .select("-password");
  if (user) {
    console.log(user);
    const post = await postModel
      .find({
        postedby: req.params.id,
      })
      .populate("postedby", "_id");

    res.json({ user, post });
  }
};

const profile = async (req, res) => {
  let post = await userModel.findByIdAndUpdate(
    req.user.user._id,
    {
      $set: { profilePhoto: req.body.pic },
    },
    {
      new: true,
    }
  );
  res.json(post);
};

module.exports = { signup, signin, follower, unfollow, getOneUser, profile };
