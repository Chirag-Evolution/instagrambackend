const postModel = require("../models/postModel");
const mongoose = require("mongoose");
const admin = require("firebase-admin");
const db = admin.firestore();
// // const create = async (req, res) => {
// //   try {
// //     let { image, body } = req.body;
// //     let userId = req.user.user._id;
// //     let postData = await postModel.create({
// //       body,
// //       photo: image,
// //       postedby: userId,
// //     });
// //     res.json({ msg: "Post Created Successfully" });
// //   } catch (err) {
// //     res.json({ msg: err });
// //   }
// // };
const create = async (req, res) => {
  try {
    const { image, body } = req.body;
    const userId = req.user.user.id; // assuming JWT contains this
    console.log("userID--------------------", userId);
    const newPost = {
      body,
      photo: image,
      postedBy: userId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection("posts").add(newPost);

    res.json({ msg: "Post Created Successfully" });
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).json({ msg: "Failed to create post", error: err.message });
  }
};
// const getPost = async (req, res) => {
//   try {
//     postData = await postModel
//       .find()
//       .populate("postedby", "_id name")
//       .populate("comments.postedBy", "name");
//     res.send(postData);
//   } catch (err) {
//     res.send(err);
//   }
// };

const getPost = async (req, res) => {
  try {
    const postsSnapshot = await db.collection("posts").get();
    const posts = [];

    for (const doc of postsSnapshot.docs) {
      const post = doc.data();
      post.id = doc.id;

      // Fetch postedBy user info
      if (post.postedBy) {
        const userRef = db.collection("users").doc(post.postedBy);
        const userSnap = await userRef.get();
        post.postedBy = userSnap.exists
          ? { _id: userSnap.id, name: userSnap.data().name }
          : null;
      }

      // Fetch each comment's postedBy info
      if (post.comments && Array.isArray(post.comments)) {
        const updatedComments = await Promise.all(
          post.comments.map(async (comment) => {
            if (comment.postedBy) {
              const commenterRef = db.collection("users").doc(comment.postedBy);
              const commenterSnap = await commenterRef.get();
              return {
                ...comment,
                postedBy: commenterSnap.exists
                  ? { name: commenterSnap.data().name }
                  : null,
              };
            }
            return comment;
          })
        );
        post.comments = updatedComments;
      }

      posts.push(post);
    }

    res.send(posts);
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).send({ error: err.message });
  }
};

// const getUserPost = async (req, res) => {
//   console.log(req.user, "userId");
//   let post = await postModel
//     .find({
//       postedby: req.user.user._id,
//     })
//     .populate("postedby", "name");

//   res.send(post);
// };

const getUserPost = async (req, res) => {
  try {
    const userId = req.user.user.id;
    console.log(req.user, "userId");

    // Query posts where postedBy == userId
    const postsSnapshot = await db
      .collection("posts")
      .where("postedBy", "==", userId)
      .get();

    const posts = [];

    // Fetch user name once
    const userSnap = await db.collection("users").doc(userId).get();
    const userName = userSnap.exists ? userSnap.data().name : null;

    postsSnapshot.forEach((doc) => {
      const postData = doc.data();
      posts.push({
        ...postData,
        id: doc.id,
        postedBy: {
          _id: userId,
          name: userName,
        },
      });
    });

    res.send(posts);
  } catch (err) {
    console.error("Error fetching user posts:", err);
    res.status(500).send({ error: err.message });
  }
};

// const likePost = async (req, res) => {
//   let data = await postModel.findByIdAndUpdate(
//     req.body.postId,
//     {
//       $push: { likes: req.user.user._id },
//     },
//     { new: true }
//   );
//   if (data) {
//     res.json({ msg: "liked" });
//   } else {
//     res.json(err);
//   }

// };
const likePost = async (req, res) => {
  const { postId } = req.body;
  const userId = req.user.user.id;

  try {
    const postRef = db.collection("posts").doc(postId);

    await postRef.update({
      likes: admin.firestore.FieldValue.arrayUnion(userId),
    });

    res.json({ msg: "Liked" });
  } catch (err) {
    console.error("Error liking post:", err);
    res.status(500).json({ error: err.message });
  }
};
// const unlikePost = async (req, res) => {
//   let data = await postModel.findByIdAndUpdate(
//     req.body.postId,
//     {
//       $pull: { likes: req.user.user._id },
//     },
//     { new: true }
//   );
//   console.log(data);
//   if (data) {
//     res.json({ msg: "unliked" });
//   } else {
//     res.json({ msg: "error" });
//   }
// };
const unlikePost = async (req, res) => {
  const { postId } = req.body;
  const userId = req.user.user.id;

  try {
    const postRef = db.collection("posts").doc(postId);

    await postRef.update({
      likes: admin.firestore.FieldValue.arrayRemove(userId),
    });

    res.json({ msg: "Unliked" });
  } catch (err) {
    console.error("Error unliking post:", err);
    res.status(500).json({ msg: "Error", error: err.message });
  }
};

// const addComment = async (req, res) => {
//   const data = {
//     comment: req.body.text,
//     postedBy: req.user.user._id,
//   };
//   console.log(data, "data", req.body);
//   if (!mongoose.Types.ObjectId.isValid(req.body.postId)) {
//     return res.status(400).json({ error: "Invalid postId" });
//   }

//   try {
//     const updatedPost = await postModel
//       .findByIdAndUpdate(
//         req.body.postId,
//         {
//           $push: {
//             comments: {
//               comment: req.body.text,
//               postedBy: req.user.user._id,
//             },
//           },
//         },
//         { new: true }
//       )
//       .populate("comments.postedBy", "_id name")
//       .exec();

//     if (!updatedPost) {
//       return res.status(404).json({ error: "Post not found" });
//     }

//     res.status(200).json(updatedPost);
//   } catch (error) {
//     console.log("Error adding comment:", error);
//     // res.status(500).json({ error: "Internal server error" });
//   }
// };

// const deletePost = async (req, res) => {
//   let postId = req.params.id;
//   console.log(postId);
//   let post = await postModel.deleteOne({ _id: postId });
//   res.send(post);
// };

const addComment = async (req, res) => {
  const { text, postId } = req.body;
  const userId = req.user.user.id;

  if (!postId || !text) {
    return res.status(400).json({ error: "Missing postId or comment text" });
  }

  try {
    const postRef = db.collection("posts").doc(postId);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Build comment object
    const newComment = {
      comment: text,
      postedBy: userId,
      createdAt: new Date(),
    };

    // Update comments array
    await postRef.update({
      comments: admin.firestore.FieldValue.arrayUnion(newComment),
    });

    // Return the updated post (without "populate", unless needed)
    const updatedPost = await postRef.get();
    res.status(200).json({ post: updatedPost.data() });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deletePost = async (req, res) => {
  const postId = req.params.id;

  try {
    await db.collection("posts").doc(postId).delete();
    res.send({ msg: "Post deleted successfully" });
  } catch (err) {
    console.error("Error deleting post:", err);
    res.status(500).send({ msg: "Error deleting post", error: err.message });
  }
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
