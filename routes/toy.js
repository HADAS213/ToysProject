const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const { auth } = require("../middlewares/auth");
const { ToysModel, toysValid } = require("../models/toysModel")

//http://localhost:3000/toys
router.get("/", async (req, res) => {
  let perPage = req.query.perPage || 10;
  let page = req.query.page || 1;


  try {
    let data = await ToysModel
      .find({})
      .limit(perPage)
      .skip((page - 1) * perPage)
      .sort({ _id: -1 })
    res.json(data);
  }
  catch (err) {

    console.log(err)
    res.status(500).json({ msg: "err", err })
  }
})
// http://localhost:3000/toys/search/?s=milk
router.get("/search", async (req, res) => {
  let perPage = req.query.perPage || 10;
  let page = req.query.page || 1;
  try {
    let queryS = req.query.s;
    // מביא את החיפוש בתור ביטוי ולא צריך את כל הביטוי עצמו לחיפוש
    // i -> מבטל את כל מה שקשור ל CASE SENSITVE
    let searchReg = new RegExp(queryS, "i")
    let data = await ToysModel.find({ $or: [{ name: searchReg }, { info: searchReg }] })
      .limit(perPage)
      .skip((page - 1) * perPage)
      .sort({ _id: -1 })
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ msg: "there error try again later", err })
  }
})

//לא גמור
router.get("/single/:id", async (req, res) => {
  let perPage = req.query.perPage || 10;
  let page = req.query.page || 1;
  try {
    let id = req.params.id;
    // מביא את החיפוש בתור ביטוי ולא צריך את כל הביטוי עצמו לחיפוש
    // i -> מבטל את כל מה שקשור ל CASE SENSITVE
    let idReg = new RegExp(id, "i")
    let data = await ToysModel.findOne({ _id: idReg })
    .limit(perPage)
    .skip((page - 1) * perPage)
    .sort({ _id: -1 })
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ msg: "there error try again later", err })
  }
})
// http://localhost:3000/toys/categories/animals
router.get("/category/:catname", async (req, res) => {
  let perPage = req.query.perPage || 10;
  let page = req.query.page || 1;
  try {
    let catName = req.params.catName;
    // מביא את החיפוש בתור ביטוי ולא צריך את כל הביטוי עצמו לחיפוש
    // i -> מבטל את כל מה שקשור ל CASE SENSITVE
    let searchReg = new RegExp(catName, "i")
    let data = await ToysModel.find({ category: searchReg })
      .limit(perPage)
      .skip((page - 1)*perPage)
      .sort({_id:-1})
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ msg: "there error try again later", err })
  }
})
router.get("/prices", async (req, res) => {
  let perPage = req.query.perPage || 10;
  let page = req.query.page || 1;
  let sort = req.query.sort || "price"
  let reverse = req.query.reverse == "yes" ? -1 : 1;

  try {
    let min = req.query.min;
    let max = req.query.max;
    if (min && max) {
      let data = await ToysModel.find({ $and: [{ price: { $gte: min } }, { price: { $lte: max } }] })
        .limit(perPage)
        .skip((page - 1) * perPage)
        .sort({ [sort]: reverse })
      res.json(data);
    }
    else if(max){
      let data = await ToyModel.find({price:{$lte:max}})
      .limit(perPage)
      .skip((page - 1)*perPage)
      .sort({[sort]:reverse})
      res.json(data);
    }else if(min){
      let data = await ToyModel.find({price:{$gte:min}})
      .limit(perPage)
      .skip((page - 1)*perPage)
      .sort({[sort]:reverse})
      res.json(data);
    }else{
      let data = await ToyModel.find({})
      .limit(perPage)
      .skip((page - 1)*perPage)
      .sort({[sort]:reverse})
      res.json(data);
    }
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ msg: "there error try again later", err })
  }
})

router.put("/:editId", auth, async (req, res) => {
  let validBody = toysValid(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    let editId = req.params.editId;
    let data = await ToysModel.updateOne({ _id: editId, user_id: req.tokenData._id }, req.body)
    if (req.tokenData.role == "admin") {
      data = await ToysModel.updateOne({ _id: editId }, req.body)
    }
    else {
      data = await ToysModel.updateOne({ _id: editId, user_id: req.tokenData._id }, req.body)
    }
    res.json(data);

  }
  catch (err) {
    console.log(err);
    res.status(500).json({ msg: "there error try again later", err })
  }
})




router.post("/", auth, async (req, res) => {

  let valdiateBody = toysValid(req.body);
  if (valdiateBody.error) {
    return res.status(400).json(valdiateBody.error.details)
  }
  try {

    let toy = new ToysModel(req.body);
    toy.user_id = String(req.tokenData._id);
    await toy.save();
    res.status(201).json(toy)
  }
  catch (err) {
    // בודק אם השגיאה זה אימייל שקיים כבר במערכת
    // דורש בקומפס להוסיף אינדקס יוניקי
    if (err.code == 11000) {
      return res.status(400).json({ msg: "Email already in system try login", code: 11000 })
    }
    console.log(err)
    res.status(500).json({ msg: "err", err })
  }
})

router.delete("/:idDel", auth, async (req, res) => {
  try {
    let idDel = req.params.idDel
    if (req.tokenData.role == "admin") {
      data = await ToysModel.deleteOne({ _id: idDel }, req.body)
    }
    else {
      data = await ToysModel.deleteOne({ _id: idDel, user_id: req.tokenData._id }, req.body)
    }
    res.json(data);
  }
  catch (err) {
    console.log(err)
    res.status(500).json({ msg: "err", err })
  }
})
module.exports = router;