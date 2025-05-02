const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://chirag:DHLKsLshoYLVlnjn@cluster0.szdwudw.mongodb.net/insta').then((res)=>
{
    console.log("connected");
}).catch((err)=>
{
    console.log(err);
});

module.exports = mongoose; // Exporting mongoose
