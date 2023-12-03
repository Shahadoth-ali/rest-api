const User=require("../models/user.model");
require("dotenv").config();
const passport=require("passport");
// const LocalStrategy=require("passport-local").Strategy;
const bcrypt=require("bcrypt");



// passport.use(new LocalStrategy(
//   async  (username, password, done)=> {

// try {
//     const user=await User.findOne({ username: username});
//     if (!user) { 
//         return done(null, false,{message:"incorrect username"});
//      }

// if(!bcrypt.compare(password,user.password)){
//     return done(null, false,{message:"incorrect password"});
// }
//     return done(null, user);
// } catch (error) {
//     return done(error);
// }
//       }))


const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, cb)
   {
   User.findOne({googleId:profile.id},(err,user)=>{
    if(err) return cb(err,null);
    if(!user){
        let newUser=new User({
            googleId:profile.id,
            username:profile.displayName,
        });
        newUser.save();
        return cb(null,newUser);
    }else{
        return cb(null,user);
    }
   })
  }
));



//create session id
//whenever we login it creates user id inside session
passport.serializeUser((user,done)=>{
    done(null,user.id);
})

//find session info using session id
passport.deserializeUser(async(id,done)=>{
    try {
        const user=await User.findById(id);
        done(null,user);
    } catch (error) {
        done(error,false);
    }
})