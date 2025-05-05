// const jwt=require('jsonwebtoken');
// const auth =(req,res,next)=>
// {

//     const authorization = req.headers['authorization']?.split(' ')[1];
//     if(!authorization)
//     {
//         return res.json({message:'You are not Logged In'});
//     }
//     if(authorization)
//     {
//        jwt.verify(authorization,'key',(err,payload)=>
//         {
//             if(err)
//             {
//                 return res.json({message:'You are not Logged In or Invalid Authorization'});
//             }
//             if(payload)
//             {

//                 console.log(payload);
//                 req.user=payload;
//                 next();
//             }
//         });

//     }
// }
// module.exports=auth;
// middleware/auth.js
// const admin = require("../firebaseAdmin");

const adminq = require("firebase-admin");
const admin = require("../instaclone-79949-firebase-adminsdk-fbsvc-c30ac0faee.json");

const auth = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    const decodedToken = await adminq.auth().verifyIdToken(token);
    req.user = decodedToken; // includes uid, email, etc.
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

module.exports = auth;
