const jwt=require('jsonwebtoken');
const auth =(req,res,next)=>
{
    
    const authorization = req.headers['authorization']?.split(' ')[1];
    if(!authorization)
    {
        return res.json({message:'You are not Logged In'});
    }
    if(authorization)
    {
       jwt.verify(authorization,'key',(err,payload)=>
        {
            if(err)
            {
                return res.json({message:'You are not Logged In or Invalid Authorization'});
            }
            if(payload)
            {
               
                console.log(payload);
                req.user=payload;
                next();
            }
        });
       
    }
}
module.exports=auth;
