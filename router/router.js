const express = require("express")
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const router = express.Router();

router.use(express.urlencoded({extended:true}))

//connecting to database
mongoose.connect("mongodb://127.0.0.1:27017/details").then(() => console.log("Connected to MongoDB user ")).catch(error => console.log("MongoDB connection error: " + error));

const userschema = new mongoose.Schema({
    username: String,
    email: String,
    password: String
});

const userModel = new mongoose.model("users", userschema)

function signin(req, res, next){
    if(req.session.isAuth){
        next();
    }else{
        res.redirect("/")
    }
}


//login page
router.get("/", async(req, res)=>{
    if(req.session.isAuth){
        res.redirect("/home")
    }else if(req.session.isadAuth){
        res.redirect("/adminpannel")
    }else{
        res.render("login")
    }
})

//signup page
router.get("/signup",(req, res)=>{
    if(req.session.isAuth){
    res.redirect("/home")
    }else{
        res.render("signup")
    }
})

//login process with db
router.post("/login", async(req, res)=>{
    try {
        const data = await userModel.findOne({username: req.body.username})
        const passwordMatch = await bcrypt.compare(req.body.password, data.password)

        if(passwordMatch){
            req.session.username = req.body.username;
            req.session.isAuth = true;
            res.redirect("/home")
        }else{
            res.render("login",{pwerror: "Invaild password"})
        }
    } catch {
        res.render("login", {unerror: "Invaild username"})
    }
})

//signup data collection
router.post("/signup", async(req, res)=>{
    const emailexist = await userModel.findOne({email: req.body.email})
    if(emailexist){
        res.render("signup", {emailexist: "Email already exist"})
    }else{
        const hashedPassword = await bcrypt.hash(req.body.password,10)
        const { username, email} = req.body;
        await userModel.insertMany([
            {   
             username: username,
             email: email,
             password: hashedPassword
            }
        ])
        res.redirect("/")
    }
})

router.get("/home", signin,(req, res)=>{
    if(req.session.isAuth){
    const cardContent = [
        {
            title:"india",
            text:"in every corner of india youll find story ,in every taste theres history and in every smile teres warmth that touchesyour heart",
            urlimg:"https://img.freepik.com/free-photo/majestic-mountain-range-tranquil-scene-dawn-generated-by-ai_188544-30834.jpg"
          },
          {
            title:"india",
            text:"in every corner of india youll find story ,in every taste theres history and in every smile teres warmth that touchesyour heart",
            urlimg:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5lfzQk7NraNcuS87iT_B2IOjlfFJu4x_sWg&usqp=CAU"
          },
          {
            title:"india",
            text:"in every corner of india youll find story ,in every taste theres history and in every smile teres warmth that touchesyour heart",
            urlimg:"https://www.state.gov/wp-content/uploads/2019/04/shutterstock_720444505v2-2208x1406-1.jpg"
          },
          {
            title:"india",
            text:"in every corner of india youll find story ,in every taste theres history and in every smile teres warmth that touchesyour heart",
            urlimg:"https://static.toiimg.com/photo/msid-89349701,width-96,height-65.cms"
          },
          {
            title:"india",
            text:"in every corner of india youll find story ,in every taste theres history and in every smile teres warmth that touchesyour heart",
            urlimg:"https://images.unsplash.com/photo-1539037116277-4db20889f2d4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bWFkcmlkfGVufDB8fDB8fHww&w=1000&q=80"
          },
          {
            title:"india",
            text:"in every corner of india youll find story ,in every taste theres history and in every smile teres warmth that touchesyour heart",
            urlimg:"https://img.freepik.com/free-photo/majestic-mountain-range-tranquil-scene-dawn-generated-by-ai_188544-30834.jpg"
          },
          {
            title:"india",
            text:"in every corner of india youll find story ,in every taste theres history and in every smile teres warmth that touchesyour heart",
            urlimg:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5lfzQk7NraNcuS87iT_B2IOjlfFJu4x_sWg&usqp=CAU"
          },
          {
            title:"india",
            text:"in every corner of india youll find story ,in every taste theres history and in every smile teres warmth that touchesyour heart",
            urlimg:"https://www.state.gov/wp-content/uploads/2019/04/shutterstock_720444505v2-2208x1406-1.jpg"
          }
    ]
    res.render("home", {cardContent});
    }else{
        res.redirect("/")
    }
})
router.get("/logout", (req, res)=>{
    req.session.isAuth = false;
    req.session.destroy()
    res.redirect("/")
})

module.exports = {router, userModel};