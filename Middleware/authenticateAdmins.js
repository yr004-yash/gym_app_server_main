const jwt=require('jsonwebtoken')
const user=require('../model/admins');
const authenticate=async(req,res,next)=>{

try {
const authHeader = req.headers['authorization'];    
const token = authHeader && authHeader.split(' ')[1];

const verifytoken=jwt.verify(token,process.env.SECRET_KEY);
const rootuser=await user.findOne({_id:verifytoken._id});

if(!rootuser){
    throw new Error('User Not Found')
}
else{
    req.token=token;
    req.rootuser=rootuser;
    req.userID=rootuser._id;
    next();
}
} catch (error) {
    console.log(error.message);
    res.status(401).send('Unauthorized');
}



}

module.exports=authenticate;