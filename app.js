const express=require('express');
const cors=require('cors');
const mongoconnection=require('./config/moongose-connection');
const app=express();
const bodyParser = require('body-parser')
const registerRouter=require('./routes/register');
const postRouter=require('./routes/userPosts')
const auth = require('./middlewares/authverify');
const port=3000;
app.use(cors());
//app.use(bodyParser.urlencoded())
app.use(bodyParser.json())
//app.use(express.json());
//app.use(express.urlencoded({ extended: true }));
app.use('/register',registerRouter);
app.use('/posts',auth,postRouter);


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })