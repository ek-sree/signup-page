const express = require("express")
const mongoose = require("mongoose")
const { userModel } = require("./router")
const bcrypt = require("bcrypt")

const adrouter = express.Router();

adrouter.use(express.urlencoded({extended:true}))


//connecting to mongodb
mongoose.connect("mongodb://127.0.0.1:27017/details").then(() => console.log("Connected to MongoDB admin")).catch(error => console.log("MongoDB connection error: " + error));

const userschema = new mongoose.Schema({
    username: String,
    password: String
})

const adminModel = new mongoose.model("admin", userschema);

//function for authentation
function adsignin(req, res, next){
    if(req.session.isadAuth){
        next()
    }else{
        res.redirect("/admin")
    }
}

//admin login first router
adrouter.get("/", async(req, res)=>{
    if(req.session.isadAuth){
        res.redirect("/admin/adhome")
    }else{
        res.render("admin")
    }
})

//admin login router
adrouter.post("/adminlogin", async(req, res)=>{
    try{
        //email checking for admin entry
        const data = await adminModel.findOne({ username: req.body.username});
    if(data.username === req.body.username){
        if(data.password === req.body.password){
            req.session.isadAuth = true;
            res.redirect("/admin/adhome")
        }else{
            res.render("admin",{pwerror:"incorrect password"})
        }
    }
    }catch{
        res.render("admin", {unerror: "Invaild username"})
    }
 })

 //admin logout user
 adrouter.get("/adminlogout", (req, res)=>{
    req.session.isadAuth = false;
    req.session.destroy();
    res.redirect("/admin")
 })

 //admin add user
 adrouter.get("/adduser", (req, res)=>{
    if(req.session.isadAuth){
    res.render("adduser");
    }else{
        res.redirect("/admin")
    }
 })

 //admin adding users
 adrouter.post("/adusersubmit", adsignin, async(req, res)=>{
    if(req.session.isadAuth){
        const emailexist = await userModel.findOne({email: req.body.email })
        if(emailexist){
            res.render("adduser", {emailexist: "email already exist"})
        }else{
            const { username, email } = req.body;
            const hashedpassword = await bcrypt.hash(req.body.password, 10)
            await userModel.insertMany([
                {
                username: username,
                email: email,
                password: hashedpassword
                }
            ])
            res.redirect("/admin/adhome")
        }
    }else{
        res.redirect("/admin/adhome")
    }
 })

 //admin home router
 adrouter.get("/adhome", adsignin, async (req, res)=>{
            if(req.session.isadAuth){
                const data = await userModel.find({})
                res.render("adminpannel", { users: data})
            }else{
                res.redirect("/admin")
                // res.send("no match found")
            }
        })

 adrouter.get("/delete/:email", adsignin, async(req, res)=>{
    if(req.session.isadAuth){
        const userid = req.params.email;
        await userModel.deleteOne({ email: userid})
        res.redirect("/admin/adhome")
    }else{
        res.redirect("/admin/adhome")
        // res.send("cant delete!")
    }
 })

 adrouter.get("/update/:email", adsignin, async(req, res)=>{
    if(req.session.isadAuth){
        const useremail = req.params.email;
        const user = await userModel.findOne({ email: useremail})
        res.render("update", {data: user})
    }else{
        res.redirect("/admin")
    }
 })


 //search buttom
 adrouter.post("/adhome", adsignin, async (req, res) => {
    if (req.session.isadAuth) {
        const searchLetter = req.body.search;
        const regex = new RegExp(`^${searchLetter}`, 'i');

        const data = await userModel.find({ username: { $regex: regex } });
        res.render("adminpannel", { users: data });
    } else {
        res.redirect("/admin/adhome");
    }
});


//admin update user
 adrouter.post("/update/:email", adsignin, async(req, res)=>{
    if (req.session.isadAuth) {
        const useremail = req.params.email;
        const emailexist= await userModel.findOne({$and:[{email:req.body.email},{email:{$ne:useremail}}]})
        if (emailexist) {
            res.render("update",{emailexist:"Email already exist"})
        }else{
            await userModel.updateOne(
                { email: useremail },
                { username: req.body.username, email: req.body.email}
            )
            res.redirect("/admin/adhome");
        }
    }
    else{
        res.redirect("/admin/adhome")
    }
})


module.exports = adrouter;