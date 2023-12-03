
const express=require("express");
const app=express();
const cors=require("cors");
const ejs=require("ejs");
require("dotenv").config();
require("./config/database");
const User=require("./models/user.model");
const bcrypt = require('bcrypt');
const saltRounds = 10;
require("./config/passport");

const passport=require("passport");
const session=require("express-session");
const MongoStore = require('connect-mongo');

app.set("view engine","ejs");
app.use(cors());
app.use(express.urlencoded({extended:true}));
app.use(express.json());

app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl:process.env.MONGO_URL,
    collectionName:"sessions",
  }),
  // cookie: { secure: true }
}))
app.use(passport.initialize())
app.use(passport.session())



//default route
app.get("/",(req,res)=>{
    res.render("index");
})

//register:get
// app.get("/register",(req,res)=>{
//     res.render("register");
// })

//register:post
// app.post("/register",async(req,res)=>{
//   try {
//     const user=await User.findOne({username:req.body.username});
// if(user)return    res.status(400).send("user already exist")
// bcrypt.hash(req.body.password, saltRounds,async (err, hash)=> {
//   const newUser=new User({
//     username:req.body.username,
//     password:hash
//   });
//   await newUser.save();
//       res.redirect("/login");
// });

//   } catch (error) {
//     res.status(500).send(error.message);
//   }
// })

//checking login or not
const checkLogged=(req,res,next)=>{
  if(req.isAuthenticated()){
    return res.redirect("/profile");
  }
  next();
}

//login:get
app.get("/login",checkLogged,(req,res)=>{
    res.render("login");
})


app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login',
successRedirect:"/profile" }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });






//login:post
// app.post('/login', 
//   passport.authenticate('local', { failureRedirect: '/login',
// successRedirect:"/profile" }),
//   );

const checkAuthenticated=(req,res,next)=>{
  if(req.isAuthenticated()){
    return next();
  }
res.redirect("/login");
}

//profile protected route
app.get("/profile",checkAuthenticated,(req,res)=>{
res.render("profile",{username:req.user.username});
})
//log out
app.get("/logout",(req,res)=>{
try {
  req.logOut((err)=>{
    if(err){
      return next(err);
    }
    res.redirect("/");
  })
} catch (error) {
  res.status(500).send(error.message);
}
})

module.exports=app;