

const port = process.env.PORT || 3000;
//jshint esversion:6
import 'dotenv/config'
import express from 'express';
import ejs from 'ejs';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import encrypt from 'mongoose-encryption'



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


userSchema.plugin(encrypt, { secret:process.env.SECRET,encryptedFields: ['password']});


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

app.post('/register',function(req,res){
    const user =new User({email:req.body.username,password:req.body.password})
    user.save();
    res.render('secrets')
})

app.post('/login', async function(req,res){
    try{
        const username=req.body.username;
        const password=(req.body.password)
       const foundUser=await User.findOne({email:username});

    if(foundUser){
        if(foundUser.password===password){
            res.render('secrets')
        }else{
            throw Error('Please check your password')
        }
    }else throw Error('Please check your email.')
    }catch(err){
        res.send(err.message)
    }


})



app.listen(port,function(){
    console.log('Server is working successfully at port 3000 ');
})