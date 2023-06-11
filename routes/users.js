const express= require("express");
const bcrypt = require("bcrypt");
const {UserModel,userValid,loginValid,genToken} = require("../models/userModel");
const {auth,authAdmin } = require("../middlewares/auth");
const router = express.Router();

router.get("/usersList" ,authAdmin , async(req,res)=> {
  try {
    let data = await UserModel.find({}, { password: 0 });
    res.json(data)
  }
  catch (err) {
    console.log(err)
    res.status(500).json({ msg: "err", err })
  }
})
router.get("/myInfo" ,auth , async(req,res)=> {
  try {
    let userInfo = await UserModel.findOne({ _id: req.tokenData._id }, { password: 0 });
    res.json(userInfo);
  }
  catch (err) {
    console.log(err)
    res.status(500).json({ msg: "err", err })
  }
})

router.post("/",async(req,res) => {
  let valdiateBody = userValid(req.body);
  if(valdiateBody.error){
    return res.status(400).json(valdiateBody.error.details)
  }
  try{
    let user = new UserModel(req.body);
    // הצפנה חד כיוונית לסיסמא ככה 
    // שלא תשמר על המסד כמו שהיא ויהיה ניתן בקלות
    // לגנוב אותה
    user.password = await bcrypt.hash(user.password, 10)
    await user.save();
    // כדי להציג לצד לקוח סיסמא אנונימית
    user.password="*****";
    res.status(201).json(user)
  }
  catch(err){
    // בודק אם השגיאה זה אימייל שקיים כבר במערכת
    // דורש בקומפס להוסיף אינדקס יוניקי
    if(err.code == 11000){
      return res.status(400).json({msg:"Email already in system try login",code:11000})
    }
    console.log(err)
    res.status(500).json({msg:"err",err})
  }
})

router.post("/login", async(req,res) => {
  let valdiateBody = loginValid(req.body);
  if(valdiateBody.error){
    return res.status(400).json(valdiateBody.error.details)
  }
  try{
    // לבדוק אם המייל שנשלח בכלל יש רשומה של משתמש שלו
    let user = await UserModel.findOne({email:req.body.email})
    if(!user){
      // שגיאת אבטחה שנשלחה מצד לקוח
      return res.status(401).json({msg:"User and password not match 1"})
    }
    // בדיקה הסימא אם מה שנמצא בבאדי מתאים לסיסמא המוצפנת במסד
    let validPassword = await bcrypt.compare(req.body.password, user.password);
    if(!validPassword){
      return res.status(401).json({msg:"User and password not match 2"})
    }
    let newToken= genToken(user._id, user.role)

    // בשיעור הבא נדאג לשלוח טוקן למשתמש שיעזור לזהות אותו 
    // לאחר מכן לראוטרים מסויימים
    res.json({token:newToken});
  }
  catch(err){
    
    console.log(err)
    res.status(500).json({msg:"err",err})
  }
})
router.delete("/:idDel",auth, async(req,res) => {
      try{
        let idDel = req.params.idDel
          if (req.tokenData.role === "admin") {
         data = await UserModel.deleteOne({ _id: idDel }, req.body)
  }
  else if (idDel === req.tokenData._id) {
        data = await UserModel.deleteOne({ _id: idDel }, req.body)
  }
  if (!data) {
    return res.status(400).json({ err: "This operation is not enabled !" })
  }
        let data = await UserModel.deleteOne({_id:idDel})
        // "deletedCount": 1 -  אם יש הצלחה של מחיקה
        res.json(data);
      }
      catch(err){
        console.log(err)
        res.status(500).json({msg:"err",err})
      }
    })
  
  router.put("/:idEdit",auth,async(req,res) => {
    let validBody = userValid(req.body);
    // בודק אם הבאדי מהצד לקוח תקין לפי הג'וי
    if(validBody.error){
      return res.status(400).json(validBody.error.details);
    }
    try{
      let idEdit = req.params.idEdit
      // תמיד בבאדי נשלח את כל המאפיינים כולל את המאפיין שנרצה לערוך
      let data;
      if (req.tokenData.role === "admin") {
        data = await UserModel.updateOne({ _id: idEdit }, req.body)
      }
      else if (idEdit === req.tokenData._id) {
        data = await UserModel.updateOne({ _id: idEdit }, req.body)
      }
      if (!data) {
        return res.status(400).json({ err: "This operation is not enabled !" })
      }
      let user = await UserModel.findOne({ _id: idEdit });
      user.password = await bcrypt.hash(user.password, 10);
      await user.save()

      // modfiedCount:1
      res.json(data);
    }
    catch(err){
      console.log(err)
      res.status(500).json({msg:"err",err})
    }
  })
  

module.exports = router;