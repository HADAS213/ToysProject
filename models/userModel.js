const mongoose = require("mongoose");
const Joi = require("joi");
const jwt=require("jsonwebtoken");
const {config} = require("../config/secret")

const userSchema = new mongoose.Schema({
  name:String,
  email:String,
  password:String,
  role: {
    type: String, default: "user"
  },
  date_created:{
      type : Date , default : Date.now()
  }
})
exports.UserModel = mongoose.model("users",userSchema);

exports.genToken=(_id,role)=>{
  let token=jwt.sign({_id,role},config.tokenSecret,{expiresIn:"60mins"});
  return token;
}

// הרשמה
exports.userValid = (_bodyValid) =>{
  let joiSchema = Joi.object({
      name: Joi.string().min(2).max(50).required(),
      email: Joi.string().min(2).max(100).email().required(),
      password: Joi.string().min(6).max(50).required(),
      role: Joi.string().min(2).max(50),
  })
  return joiSchema.validate(_bodyValid);
}
// התחברות
exports.loginValid = (_bodyValid) =>{
  let joiSchema = Joi.object({
      email: Joi.string().min(2).max(100).email().required(),
      password: Joi.string().min(6).max(50).required(),
  })
  return joiSchema.validate(_bodyValid);
}