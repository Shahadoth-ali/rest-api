const express=require("express");
require("dotenv").config();
const app=express();
const mongoose=require("mongoose");
const User=require("./models/user.model");
const cors=require("cors");
// const md5=require("md5");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const PORT=process.env.PORT || 5000;
const dbURL=process.env.MONGO_URL;



mongoose.connect(dbURL)
.then(()=>{
    console.log("atlas is connected");
})
.catch((error)=>{
    console.log(error);
    process.exit(1);
})

app.use(cors());
app.use(express.urlencoded({extended:true}));
app.use(express.json());


//default route
app.get("/",(req,res)=>{
    res.sendFile(__dirname+"/views/index.html");
})

//register
app.post("/register",async(req,res)=>{
    // const {email,password}=req.body;
  try {
 
    bcrypt.hash(req.body.password, saltRounds,async function(err, hash) {
        // Store hash in your password DB.
        const newUser=new User({
            email:req.body.email,
            // password:md5(req.body.password)
            password:hash,
        });
        await newUser.save();
        res.status(201).json(newUser)
    });
  } catch (error) {
    res.status(500).json(error.message);
  }
})


//login
app.post("/login",async(req,res)=>{
    try {
       const email=req.body.email;
       const password=req.body.password;
       const user=await User.findOne({
email:email
       });
       if(user){
        bcrypt.compare(password,user.password, function(err, result) {
            // result == true
            if(result===true){
                res.status(200).json({status:"valid user"})
            }
        });
       
       }else{
       res.status(404).json({
        status:"not valid user"
       });
       }
      
      } catch (error) {
        res.status(500).json(error.message);
      }
})

//listening port
app.listen(PORT,()=>{
    console.log(`server is running at http://localhost:${PORT}`);

})
//routes not found
app.use((req,res,next)=>{
    res.status(404).json({
       message:"route is not found"
    });
   })
