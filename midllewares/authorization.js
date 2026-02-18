const authorize=function(...roles){
    return (req,res,next)=>{
        const role=req.user.role;
        if(!roles.includes(role)){
            res.status(404).json({status:"Error",massege:"You Are Not Authorized"})
        }
        else{
            next();
        }
    }
}
module.exports = authorize;