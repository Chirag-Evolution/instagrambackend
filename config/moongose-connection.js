// const mongoose = require('mongoose');

// mongoose.connect('mongodb+srv://chirag:DHLKsLshoYLVlnjn@cluster0.szdwudw.mongodb.net/insta').then((res)=>
// {
//     console.log("connected");
// }).catch((err)=>
// {
//     console.log(err);
// });

// module.exports = mongoose; // Exporting mongoose
const admin = require("firebase-admin");
const serviceAccount = require("../instaclone-79949-firebase-adminsdk-fbsvc-c30ac0faee.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
// Test connection by fetching Firestore's timestamp
db.collection("test")
  .limit(1)
  .get()
  .then(() => console.log("✅ Firestore connected successfully"))
  .catch((error) => console.error("❌ Firestore connection failed:", error));
module.exports = db;
