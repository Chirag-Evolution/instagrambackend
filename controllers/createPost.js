const postModel = require("../models/postModel");
const mongoose = require("mongoose");
const create = async (req, res) => {
  try {
    let { image, body } = req.body;
    let userId = req.user.user._id;
    let postData = await postModel.create({
      body,
      photo: image,
      postedby: userId,
    });
    res.json({ msg: "Post Created Successfully" });
  } catch (err) {
    res.json({ msg: err });
  }
};

const getPost = async (req, res) => {
  try {
    postData = await postModel
      .find()
      .populate("postedby", "_id name")
      .populate("comments.postedBy", "name");
    res.send(postData);
  } catch (err) {
    res.send(err);
  }
};

const getUserPost = async (req, res) => {
  console.log(req.user, "userId");
  let post = await postModel
    .find({
      postedby: req.user.user._id,
    })
    .populate("postedby", "name");

  res.send(post);
};

const likePost = async (req, res) => {
  let data = await postModel.findByIdAndUpdate(
    req.body.postId,
    {
      $push: { likes: req.user.user._id },
    },
    { new: true }
  );
  if (data) {
    res.json({ msg: "liked" });
  } else {
    res.json(err);
  }
  // .exec((err, result) => {
  //   if (err) {
  //     return res.status(422).json({ error: err });
  //   } else {
  //     return res.json(result);
  //   }
  // });
};

const unlikePost = async (req, res) => {
  let data = await postModel.findByIdAndUpdate(
    req.body.postId,
    {
      $pull: { likes: req.user.user._id },
    },
    { new: true }
  );
  console.log(data);
  if (data) {
    res.json({ msg: "unliked" });
  } else {
    res.json({ msg: "error" });
  }
};

const addComment = async (req, res) => {
  const data = {
    comment: req.body.text,
    postedBy: req.user.user._id,
  };
  console.log(data, "data", req.body);
  if (!mongoose.Types.ObjectId.isValid(req.body.postId)) {
    return res.status(400).json({ error: "Invalid postId" });
  }
  //   let comments = await postModel
  //     .findByIdAndUpdate(
  //       req.body.postId,
  //       {
  //         $push: {
  //           comments: {
  //             comment: req.body.text,
  //             postedBy: req.user.user._id,
  //           },
  //         },
  //       },
  //       { new: true }
  //     )
  //     .populate("comments.postedBy", "_id name");

  try {
    const updatedPost = await postModel
      .findByIdAndUpdate(
        req.body.postId,
        {
          $push: {
            comments: {
              comment: req.body.text,
              postedBy: req.user.user._id,
            },
          },
        },
        { new: true }
      )
      .populate("comments.postedBy", "_id name")
      .exec();

    if (!updatedPost) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.status(200).json(updatedPost);
  } catch (error) {
    console.log("Error adding comment:", error);
    // res.status(500).json({ error: "Internal server error" });
  }
};

const deletePost = async (req, res) => {
  let postId = req.params.id;
  console.log(postId);
  let post = await postModel.deleteOne({ _id: postId });
  res.send(post);
};

const myfollowing = async (req, res) => {
  let post = await postModel
    .find({
      postedby: { $in: req.user.following },
    })
    .populate("postedby", "_id name")
    .populate("comments.postedBy", "_id name");
  res.json(post);
};
module.exports = {
  create,
  getPost,
  getUserPost,
  likePost,
  unlikePost,
  addComment,
  deletePost,
  myfollowing,
};
