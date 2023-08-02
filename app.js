

const port = process.env.PORT || 3000;
//jshint esversion:6
require('dotenv').config();
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const session = require('express-session');
const passport = require('passport');
// const LocalStrategy = require('passport-local').Strategy;
const passportLocalMongoose = require('passport-local-mongoose');
const crypto = require('crypto');

const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');

// Rest of your code...



const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

app.use(session({
    secret:'Our little secret.',
    resave:false,
    saveUninitialized:false

}))

app.use(passport.initialize())
app.use(passport.session())

mongoose.connect('mongodb://127.0.0.1:27017/userDB')




const userSchema=new mongoose.Schema({
    email:String,
    password:String,
    googleId:String,
    secret:String
});

userSchema.plugin(passportLocalMongoose)
userSchema.plugin(findOrCreate)



const User =new mongoose.model('user',userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, cb) {
    process.nextTick(function() {
      cb(null, { id: user.id, username: user.username, name: user.name });
    });
  });
  
  passport.deserializeUser(function(user, cb) {
    process.nextTick(function() {
      return cb(null, user);
    });
  });

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL:'https://www.googleapis.com/oauth2/v3/userinfo'
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));


app.get('/',function(req,res){
    res.render('home.ejs');
})

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));
  app.get('/auth/google/secrets', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secrets');
  });

app.get('/login',function(req,res){
    res.render('login.ejs');
})

app.get('/logout',function(req,res){
    req.logout(function(err) {
        if (err) { return next(err); }
    res.redirect('/');
})


})
app.get('/register',function(req,res){
    res.render('register.ejs');
})


app.get('/secrets',async function(req,res){
   const userhasSecrets=await User.find({'secret':{$ne:null}})
   res.render('secrets',{secrets:userhasSecrets})


})


// app.get('/secrets',async function(req,res){
//     if(req.isAuthenticated()){
//       const loggedUser=await User.findById(req.user.id).exec();
//       const secret=loggedUser.secret;
//      res.render('secrets',{secret:secret})
//     }else res.redirect('/login')

// })



app.get('/submit', function(req,res){
    if(req.isAuthenticated()){
        res.render('submit')
       }else res.redirect('/login')
})

app.post('/submit',async function(req,res){
    const submittedSecret=req.body.secret;
const loggedUser=await User.findById(req.user.id).exec();
loggedUser.secret=submittedSecret;
loggedUser.save();
res.redirect('/secrets')

})

app.post('/register',async function(req,res,){



User.register({username:req.body.username}, req.body.password, function(err, user) {
    if (err){
        console.log(err);
        res.redirect('/register')
    }else{
        passport.authenticate('local')(req,res,function(){
            res.redirect('/secrets')
        })

    }

      // Value 'result' is set to false. The user could not be authenticated since the user is not active
    });
  
})

app.post('/login',function(req,res){
const user=new User({
    username:req.body.username,
    password:req.body.password
})

req.login(user,function(err){
    if(err){
        console.log(err);
    }else{
        passport.authenticate('local')(req,res,function(){
            res.redirect('/secrets')
        })
    }
})


})
       
app.listen(port,function(){
    console.log('Server is working successfully at port 3000 ');
})