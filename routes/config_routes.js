const indexR=require("./index");
const userR=require("./users");
const toysR=require("./toy");

exports.routesInit=(app)=>{
    app.use("/",indexR);
    app.use("/users",userR);
    app.use("/toys",toysR);
}