const jwt=require("jsonwebtoken");
const authenticate=function(req,res,next){
const token=req.cookies.token;
if (!token) {
    return res.status(401).json({
      status: "Error",
      message: "You don't have a token",
    });
  }
  try{
    const veryfied=jwt.verify(token,process.env.Jwt_secretKey);
    req.user=veryfied;
    next();
  }
  catch (err) {
    return res.status(403).json({
      status: "Error",
      message: "Invalid or expired token",
    });
  }
}
module.exports = authenticate;