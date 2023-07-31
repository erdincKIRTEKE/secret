

const port = process.env.PORT || 3000;
//jshint esversion:6
import 'dotenv/config'
import express from 'express';
import ejs from 'ejs';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import bcrypt, { hash } from 'bcrypt'
import session from 'express-session';


const saltRounds=10;  




const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect('mongodb://127.0.0.1:27017/userDB')


const userSchema=new mongoose.Schema({
    email:String,
    password:String
});





const User =new mongoose.model('user',userSchema);



app.get('/',function(req,res){
    res.render('home.ejs');
})

app.get('/login',function(req,res){
    res.render('login.ejs');
})
app.get('/register',function(req,res){
    res.render('register.ejs');
})



app.post('/register',async function(req,res,){

var salt = crypto.randomBytes(16);
crypto.pbkdf2(req.body.password, salt, 310000, 32, 'sha256', function(err, hashedPassword) {
  if (err) { return next(err); }
  db.run('INSERT INTO users (username, hashed_password, salt) VALUES (?, ?, ?)', [
    req.body.username,
    hashedPassword,
    salt
  ], function(err) {
    if (err) { return next(err); }
    var user = {
      id: this.lastID,
      username: req.body.username
    };
    req.login(user, function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
  });
});
});


// app.post('/register',async function(req,res){
//     try{
//         bcrypt.hash(req.body.password,saltRounds,async function(err,hash){
//             const user =new User({email:req.body.username,password:hash})
//             const newUSer=await user.save();
//             if(!newUSer){
//                 throw Error(' user  is not registered')
//             }
//             if(err){
//             throw Error('check your mail and password')
//             }else{
//                 res.render('secrets')
//             }
   
//         })
       
//     }catch(err){
//         console.error(err);
//         res.send(err.message)

//     }
   
// })

app.post('/login',function(req,res){
        const username=req.body.username;
        const password=req.body.password
    
       async function checkUser(username, password) {

        try{//... fetch user from a db etc.
            const user=await User.findOne({email:username});
            if (!user){ res.send('check your email')}
    
            const match = await bcrypt.compare(password, user.password);
    
            if(match) {
               res.render('secrets')
            } else throw Error('Please check your password')    //.

        }catch(err){
            res.send(err.message)
    }

    }
    checkUser(username,password)
    })



app.listen(port,function(){
    console.log('Server is working successfully at port 3000 ');
})