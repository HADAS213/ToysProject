const mongoose = require("mongoose");
const Joi = require("joi");

const toysSchema = new mongoose.Schema({
  name:String,
  info:String,
  category:String,
  img_url: String,
  price: Number, 
  user_id:String,
  date_created:{
    type : Date , default : Date.now()
}
})
exports.ToysModel = mongoose.model("toys",toysSchema);

exports.toysValid = (_bodyValid) =>{
    let joiSchema = Joi.object({
        name: Joi.string().min(2).max(50).required(),
        info: Joi.string().min(2).max(300).required(),
        category: Joi.string().min(2).max(100).required(),
        img_url: Joi.string().min(2).max(100),
        price: Joi.number().min(1).max(300).required(),
    })
    return joiSchema.validate(_bodyValid);
  }