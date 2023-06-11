const express = require("express");
const bcrybpt = require("bcrypt");
const { auth } = require("../Middlewares/auth");
const { ToysModel, validateToy } = require("../models/toyModel")
const router = express.Router();

router.get("/", async (req, res) => {
    let perPage = req.query.perPage || 10;
    let page = req.query.page || 1;
    try {
        let data = await ToysModel.find({})
            .limit(perPage)
            .skip((page - 1) * perPage)
            // .sort({_id:-1}) like -> order by _id DESC
            .sort({ _id: -1 })
        res.json(data);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: "there error try again later", err })
    }
})

// /cakes/search?s=
router.get("/search", async (req, res) => {
    try {
        let queryS = req.query.s;
        // מביא את החיפוש בתור ביטוי ולא צריך את כל הביטוי עצמו לחיפוש
        // i -> מבטל את כל מה שקשור ל CASE SENSITVE
        let searchReg = new RegExp(queryS, "i")
        let data = await ToysModel.find({ name: searchReg } || { info: searchReg })
            .limit(50)
            .skip((page - 1) * perPage)
            // .sort({_id:-1}) like -> order by _id DESC
            .sort({ _id: -1 })
        res.json(data);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: "there error try again later", err })
    }
})
router.get("/single/:id", async (req, res) => {
    let perPage = req.query.perPage || 10;
    let page = req.query.page || 1;
    try {
        let id = req.params.id;
        let idReg = new RegExp(id, "i");
        let data = await ToysModel.findOne({ id: idReg })
            .limit(perPage)
            .skip((page - 1) * perPage)
            .sort({ _id: -1 })
        res.json(data);
    }
    catch {
        console.log(err);
        res.status(500).json({ msg: "there error try again later", err })
    }
})

router.get("/category/:catName", async (req, res) => {
    let perPage = req.query.perPage || 10;
    let page = req.query.page || 1;


    try {


        // req.params.catName -> מכיל את הפראמס
        let catName = req.params.catName;
        // http://localhost:3002/prods/categories/animals
        let searchReg = new RegExp(catName, "i");
        let data = await ToysModel.find({ category: searchReg })
            .limit(perPage)
            .skip((page - 1) * perPage)
            .sort({ _id: -1 })
        res.json(data);
    }
    catch {
        console.log(err);
        res.status(500).json({ msg: "there error try again later", err })
    }
})

router.get("/prices", async(req,res)=>{
    let perPage = req.query.perPage || 10;
    let page = req.query.page || 1;
    let sort=req.query.sort||"price";
    let reverse=req.query.reverse=="yes"?-1:1;

    try{
        let min=req.query.min;
        let max=req.query.max;
        if(min&&max){
            let data=await ToysModel.find({$and: [{price:{$gte:min}},{price:{$lte:max}}]})
            .limit(perPage)
            .skip((page-1)*perPage)
            .sort({[sort]:reverse})
            res.json(data)
        }
        else if(max){
            let data=await ToysModel.find({price:{$lte:max}})
            .limit(perPage)
            .skip((page-1)*perPage)
            .sort({[sort]:reverse})
            res.json(data)
        }
        else if(min){
            let data=await ToysModel.find({price:{$lte:max}})
            .limit(perPage)
            .skip((page-1)*perPage)
            .sort({[sort]:reverse})
            res.json(data)
        }else{
            let data=await ToysModel.find({})
            .limit(perPage)
            .skip((page-1)*perPage)
            .sort({[sort]:reverse})
            res.json(data)
        }

    }
    catch{
        console.log(err);
        res.status(500).json({ msg: "there error try again later", err })
    }


})
router.post("/", auth, async (req, res) => {
    let validBody = validateToy(req.body);
    if (validBody.error) {
        return res.status(400).json(validBody.error.details);
    }
    try {
        let toy = new ToysModel(req.body);
        toy.user_id = req.tokenData._id;
        await toy.save();
        res.status(201).json(toy);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: "there error try again later", err })
    }
})


router.put("/:editId", auth, async (req, res) => {
    let validBody = validateToy(req.body);
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

router.delete("/:delId", auth, async (req, res) => {
    try {
        let delId = req.params.delId;
        let data = await ToysModel.deleteOne({ _id: delId, user_id: req.tokenData._id })
        res.json(data);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: "there error try again later", err })
    }
})

module.exports = router;


