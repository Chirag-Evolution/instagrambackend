const jwt = require("jsonwebtoken");
//const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const postModel = require("../models/postModel");
const admin = require("firebase-admin");
const db = admin.firestore();
// const signup = async (req, res) => {
//   let data = req.body;

//   let userAvailableData = await userModel.findOne({
//     $or: [
//       {
//         email: data.email,
//       },
//       { uname: data.uname },
//     ],
//   });
//   if (userAvailableData) {
//     return res.send({
//       message: "User is Already Registed,Try with different email",
//     });
//   }

//   try {
//     let hashpassword = await bcrypt.hash(data.password, 10);
//     let user = await userModel.create({
//       name: data.name,
//       email: data.email,
//       uname: data.uname,
//       password: hashpassword,
//     });
//     if (user) {
//       res.send({ message: "Registered Successfully" });
//     } else {
//       res.send({ message: "Error in Registration, Try Again Later" });
//     }
//   } catch (err) {
//     res.send({ message: "Error in Registration, Try Again Later", err });
//   }
// };

const signup = async (req, res) => {
  let data = req.body;

  // Check if the user already exists in Firestore
  try {
    const usersRef = db.collection("users"); // Renamed to usersRef to avoid conflict

    // Check if email or username is already taken
    const snapshot = await usersRef.where("email", "==", data.email).get();
    const unameSnapshot = await usersRef.where("uname", "==", data.uname).get();

    if (!snapshot.empty || !unameSnapshot.empty) {
      return res.send({
        message:
          "User is already registered, try with a different email or username",
      });
    }

    // Hash password
    let hashpassword = await bcrypt.hash(data.password, 10);

    // Create new user document in Firestore
    const userRef = usersRef.doc(); // Now using userRef to create a new document with auto-generated ID
    const user = {
      name: data.name,
      email: data.email,
      uname: data.uname,
      password: hashpassword,
    };

    await userRef.set(user);

    res.send({ message: "Registered Successfully" });
  } catch (err) {
    console.log(err);
    res.send({ message: "Error in Registration, Try Again Later", err });
  }
};

// const signin = async (req, res) => {
//   let user = await userModel.findOne({ email: req.body.email });
//   if (!user) {
//     return res.json({ msg: "User Not Found" });
//   }
//   try {
//     if (user) {
//       bcrypt.compare(req.body.password, user.password, function (err, result) {
//         if (result) {
//           var token = jwt.sign({ user }, "key");
//           return res.json({
//             msg: "log in",
//             result: result,
//             token: token,
//             user: user,
//           });
//         } else {
//           return res.json({ msg: "Invalid Credential", result: result });
//         }
//       });
//     }
//   } catch (err) {
//     res.send({ msg: "Invalid", result: err });
//   }
// };
const signin = async (req, res) => {
  try {
    const usersRef = db.collection("users");
    const snapshot = await usersRef.where("email", "==", req.body.email).get();

    if (snapshot.empty) {
      return res.json({ msg: "User Not Found" });
    }

    const userDoc = snapshot.docs[0];
    const user = userDoc.data();
    const userId = userDoc.id;

    // Compare password
    const match = await bcrypt.compare(req.body.password, user.password);

    if (match) {
      const token = jwt.sign({ user: { ...user, id: userId } }, "key");
      return res.json({
        msg: "Logged in",
        result: true,
        token: token,
        user: { ...user, id: userId },
      });
    } else {
      return res.json({ msg: "Invalid Credentials", result: false });
    }
  } catch (err) {
    console.error("Signin error:", err);
    res.status(500).json({ msg: "Internal Server Error", error: err.message });
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

// const follower = async (req, res) => {
//   try {
//     // Add current user to the followers of the target user
//     const updatedFollowedUser = await userModel.findByIdAndUpdate(
//       req.body.followId,
//       {
//         $push: { followers: req.user.user._id },
//       },
//       { new: true }
//     );

//     // Add the followed user to the current user's following list
//     const updatedCurrentUser = await userModel.findByIdAndUpdate(
//       req.user.user._id,
//       {
//         $push: { following: req.body.followId },
//       },
//       { new: true }
//     );

//     res.status(200).json({
//       message: "Follow successful",
//       updatedFollowedUser,
//       updatedCurrentUser,
//     });
//   } catch (error) {
//     console.error("Follow error:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

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

const follower = async (req, res) => {
  const currentUserId = req.user.user.id;
  const followId = req.body.followId;

  if (!followId || !currentUserId) {
    return res.status(400).json({ error: "Missing user IDs" });
  }

  try {
    const followedUserRef = db.collection("users").doc(followId);
    const currentUserRef = db.collection("users").doc(currentUserId);

    // Update followed user's followers list
    await followedUserRef.update({
      followers: admin.firestore.FieldValue.arrayUnion(currentUserId),
    });

    // Update current user's following list
    await currentUserRef.update({
      following: admin.firestore.FieldValue.arrayUnion(followId),
    });

    // Optional: Fetch updated user data
    const updatedFollowedUser = await followedUserRef.get();
    const updatedCurrentUser = await currentUserRef.get();

    res.status(200).json({
      message: "Follow successful",
      updatedFollowedUser: updatedFollowedUser.data(),
      updatedCurrentUser: updatedCurrentUser.data(),
    });
  } catch (error) {
    console.error("Follow error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// const unfollow = async (req, res) => {
//   try {
//     // Remove current user from the followers of the target user
//     const updatedUnfollowedUser = await userModel.findByIdAndUpdate(
//       req.body.followId,
//       {
//         $pull: { followers: req.user.user._id },
//       },
//       { new: true }
//     );

//     // Remove the target user from the current user's following list
//     const updatedCurrentUser = await userModel.findByIdAndUpdate(
//       req.user.user._id,
//       {
//         $pull: { following: req.body.followId },
//       },
//       { new: true }
//     );

//     res.status(200).json({
//       message: "Unfollow successful",
//       updatedUnfollowedUser,
//       updatedCurrentUser,
//     });
//   } catch (error) {
//     console.error("Unfollow error:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

const unfollow = async (req, res) => {
  const currentUserId = req.user.user._id;
  const unfollowId = req.body.followId;

  if (!unfollowId || !currentUserId) {
    return res.status(400).json({ error: "Missing user IDs" });
  }

  try {
    const unfollowedUserRef = db.collection("users").doc(unfollowId);
    const currentUserRef = db.collection("users").doc(currentUserId);

    // Remove current user from the followers list of the target user
    await unfollowedUserRef.update({
      followers: admin.firestore.FieldValue.arrayRemove(currentUserId),
    });

    // Remove the target user from the current user's following list
    await currentUserRef.update({
      following: admin.firestore.FieldValue.arrayRemove(unfollowId),
    });

    // Optional: Fetch updated documents
    const updatedUnfollowedUser = await unfollowedUserRef.get();
    const updatedCurrentUser = await currentUserRef.get();

    res.status(200).json({
      message: "Unfollow successful",
      updatedUnfollowedUser: updatedUnfollowedUser.data(),
      updatedCurrentUser: updatedCurrentUser.data(),
    });
  } catch (error) {
    console.error("Unfollow error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// const getOneUser = async (req, res) => {
//   const user = await userModel
//     .findOne({ _id: req.params.id })
//     .select("-password");
//   if (user) {
//     console.log(user);
//     const post = await postModel
//       .find({
//         postedby: req.params.id,
//       })
//       .populate("postedby", "_id");

//     res.json({ user, post });
//   }
// };

const getOneUser = async (req, res) => {
  const userId = req.params.id;

  try {
    // Get user data from Firestore
    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    const userData = userDoc.data();
    delete userData.password; // Remove password from the response

    // Get posts by this user
    const postsSnapshot = await db
      .collection("posts")
      .where("postedby", "==", userId)
      .get();

    const posts = [];
    postsSnapshot.forEach((doc) => {
      posts.push({ id: doc.id, ...doc.data() });
    });

    res.json({ user: userData, post: posts });
  } catch (err) {
    console.error("Error fetching user and posts:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// const profile = async (req, res) => {
//   let post = await userModel.findByIdAndUpdate(
//     req.user.user._id,
//     {
//       $set: { profilePhoto: req.body.pic },
//     },
//     {
//       new: true,
//     }
//   );
//   res.json(post);
// };

const profile = async (req, res) => {
  const userId = req.user.user.id; // Ensure this is the correct UID from your token
  const profilePhotoUrl = req.body.pic;

  try {
    const userRef = db.collection("users").doc(userId);

    // Update the profilePhoto field
    await userRef.update({
      profilePhoto: profilePhotoUrl,
    });

    // Fetch updated user data
    const updatedUserDoc = await userRef.get();
    const updatedUserData = updatedUserDoc.data();
    delete updatedUserData.password;

    res.json(updatedUserData);
  } catch (error) {
    console.error("Error updating profile photo:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { signup, signin, follower, unfollow, getOneUser, profile };
