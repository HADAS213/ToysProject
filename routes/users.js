const express = require("express");
const bcrypt = require("bcrypt");
const { auth, authAdmin } = require("../Middlewares/auth");
const { UserModel, validUser, validLogin, genToken } = require("../models/userModel");
const { route } = require("./toys");
const router = express.Router();

router.get("/userList", authAdmin, async (req, res) => {

  try {
    let data = await UserModel.find({}, { password: 0 })
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ msg: "there error try again later", err })
  }
})


// אזור שמחזיר למשתמש את הפרטים שלו לפי הטוקן שהוא שולח
router.get("/myInfo", auth, async (req, res) => {
  try {
    let userInfo = await UserModel.findOne({ _id: req.tokenData._id }, { password: 0 });
    res.json(userInfo);
  }
  catch (err) {
    console.log(err)
    res.status(500).json({ msg: "err", err })
  }
})

router.post("/", async (req, res) => {
  let validBody = validUser(req.body);
  // במידה ויש טעות בריק באדי שהגיע מצד לקוח
  // יווצר מאפיין בשם אירור ונחזיר את הפירוט של הטעות
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    let user = new UserModel(req.body);
    // נרצה להצפין את הסיסמא בצורה חד כיוונית
    // 10 - רמת הצפנה שהיא מעולה לעסק בינוני , קטן
    user.password = await bcrypt.hash(user.password, 10);

    await user.save();
    user.password = "***";
    res.status(201).json(user);
  }
  catch (err) {
    if (err.code == 11000) {
      return res.status(500).json({ msg: "Email already in system, try log in", code: 11000 })

    }
    console.log(err);
    res.status(500).json({ msg: "err", err })
  }
})

router.post("/login", async (req, res) => {
  let validBody = validLogin(req.body);
  if (validBody.error) {
    // .details -> מחזיר בפירוט מה הבעיה צד לקוח
    return res.status(400).json(validBody.error.details);
  }
  try {
    // קודם כל לבדוק אם המייל שנשלח קיים  במסד
    let user = await UserModel.findOne({ email: req.body.email })
    if (!user) {
      return res.status(401).json({ msg: "Password or email is worng ,code:2" })
    }
    // אם הסיסמא שנשלחה בבאדי מתאימה לסיסמא המוצפנת במסד של אותו משתמש
    let authPassword = await bcrypt.compare(req.body.password, user.password);
    if (!authPassword) {
      return res.status(401).json({ msg: "Password or email is worng ,code:1" });
    }
    // מייצרים טוקן לפי שמכיל את האיידי של המשתמש
    let token = genToken(user._id, user.role);
    res.json({ token });
  }
  catch (err) {
    console.log(err)
    res.status(500).json({ msg: "err", err })
  }
})

router.delete("/idDel", auth, async (req, res) => {
  try {
    let idDel = req.params.idDel;
    if (req.tokenData.role == "admin") {
      data = await UserModel.deleteOne({ _id: idDel }, req.body)
    }
    else if (idDel === req.tokenData._id) {
      data = await UserModel.deleteOne({ _id: idDel }, req.body);
    }
if(!data){
  return res.status(400).json({err:"This operation is not enable!"})
}
let data=await UserModel.deleteOne({_id:idDel})
res.json(data)
  }
  catch{
    console.log(err);
    res.status(500).json({msg:"err",err})
  }
})

router.put("/:idEdit",auth,async (req,res)=>{
  let validBody=validUser(req.body);
  if(validBody.error){
    return res.status(400).json(validBody.error.details)
  }
  try{
    let idEdit=req.params.idEdit;
    let data;
    if(req.tokenData.role==="admin"){
      data=await UserModel.updateOne({_id:idEdit},req.body)
    }
    else if(idEdit===req.tokenData._id){
      data=await UserModel.updateOne({_id:idEdit},req.body)
    }
    if(!data){
      return res.status(400).json({err:"This operation is not enable!"})
    }
    let user =await UserModel.findOne({_id:idEdit});
    user.password=await bcrypt.hash(user.password,10);
    await user.save()

    res.json(data)
  }
  catch{
    console.log(err)
    res.status(500).json({ msg: "err", err })
  }
})

module.exports = router;