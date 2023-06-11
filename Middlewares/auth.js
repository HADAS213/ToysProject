// const { config } = require("dotenv");
const jwt = require("jsonwebtoken");
const {config}= require("../config/secret")

// פונקצית מידל וואר שבודקת טוקן
// middleware
exports.auth = async(req,res,next) => {
  let token = req.header("x-api-key");
  if(!token){
    return res.status(401).json({msg:"You need to send token to this endpoint url 2222"})
  }
  try{
    // מנסה לפענח את הטוקן ויכיל את כל המטען/מידע שבתוכו
    let decodeToken = jwt.verify(token,config.tokenSecret);
    // דואג להעיבר את המאפיין של הטוקן דאטא לפונקציה הבאה בשרשור
    // שאנחנו מזמנים בנקסט ככה שתיהיה חשופה למידע
    // במקרה הזה האיי די שפענחנו מהטוקן
    req.tokenData = decodeToken
    // next() -> אם הכל בסדר לעבור לפונקציה הבאה שרשור
    next()
  }
  catch(err){
   return res.status(401).json({msg:"Token not valid or expired 22222"})
  }
}
exports.authAdmin=(req,res,next)=>{
  let token=req.header("x-api-kry");
  if(!token){
    return res.status(401).json({msg:"You need send token"})
  }
  try{
    let decodeToken=jwt.verify(token,config.tokenSecret);
    if(decodeToken.role!="admin"){
      return res.status(401).json({msg:"Token invalid or wxpired, code: 43"});
    }
    req.tokenData=decodeToken;
    next()
  }
  catch(err){
    console.log(err);
    return res.status(401).json({msg:"Token invalid or expired, log in again"})
  }
}