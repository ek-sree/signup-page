const express = require("express")
const session = require("express-session")
const nocache = require("nocache")
// const path = require("path")
const {router} = require("./router/router")
const adminrouter = require("./router/admin")

const app = express()

app.set("view engine", "hbs")
// app.use(express.static(__dirname + "./public"))
app.use(express.static("public"))
app.use(express.urlencoded({extended: true}))

app.use(nocache());

app.use(session({
        secret:"skey",
        resave:false,
        saveUninitialized:true
    })
);


//router connect
app.use("/", router);
app.use("/admin", adminrouter);


//server host
app.listen(3000,()=>{
    console.log("server started on http://localhost:3000");
});







// adrouter.route("/adhome")
// .get(adsignin, async (req, res)=>{
//     if(req.session.isadAuth){
//         const data = await userModel.find({})
//         res.render("adminpannel", { users: data})
//     }else{
//         res.redirect("/admin")
//         // res.send("no match found")
//     }
// })