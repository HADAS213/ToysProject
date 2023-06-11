const indexR= require("./index");
const usersR= require("./users");
// const cakesR= require("./cakes");
const toysR=require("./toys");


exports.routesInit =(app)=>{
    app.use("/",indexR)
    app.use("/users",usersR)
//    app.use("/cakes",cakesR)
   app.use("/toys",toysR)
  
}