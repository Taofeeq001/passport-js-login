// STEP 1
const express = require("express")
const mongoose = require('mongoose')
const session = require('express-session')
const passport = require('passport')
const passportLocalMongoose = require('passport-local-mongoose')
const port = 3900

// STEP 2
const app= express()
app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.use(session({
    secret:'loyalty',
    resave:false,
    saveUninitialized:true,
    cookie: {maxAge: 24*64000}
}))

app.use(passport.initialize());
app.use(passport.session());

// STEP 3

const userSchema = new mongoose.Schema({
    username:String,
    email:String,
    password:String
})

// STEP 4
userSchema.plugin(passportLocalMongoose)

// MODEL
const User = new mongoose.model("User", userSchema)

passport.use(User.createStrategy())

// SERIALIZE user
passport.serializeUser(User.serializeUser())

// DESERIALIZE USER

passport.deserializeUser(User.deserializeUser())

// CONNECT TO DATABASE
const connectionString = 'mongodb+srv://kolapo:lesson2023@lesson.jrzb2z2.mongodb.net/?retryWrites=true&w=majority'
const connectDB = async()=>{
    await mongoose.connect(connectionString);
    console.log("connected")
}

// Auth
// Sign Up
app.post("/signup", async(req, res)=>{
    const {username, email, password} = req.body
    if(!username || !email ||!password){
        return res.json({error: 'all field required'})
    }
    const existingUser = await User.findOne({email})
    if(existingUser){
        return res.json({error:'user already exist'})  
    }
    const newUser = new User({
        email:email,
        username:username
    })
    User.register(newUser, password, function(err){
        if(err){
            console.log(err)
        }

        passport.authenticate("local")(req, res, function(){
            res.json({msg:'sign up successful'})
        })
    })
})

// Sign In
app.post("/login", async(req,res)=>{
    const {username, password} = req.body
    if(!username || !password){
        return res.json({error:'filed required!!!'})
    }
    const existingUser = await User.findOne({username})
    if(!existingUser){
        return res.json({error: 'user not found'})
    }
    const user = new User({
        username,
        password
    })
    req.login(user, function(err){
        if(err){
            return res.json(err)
        }
        passport.authenticate("local") (req,res, function(){
            res.json({msg:"Login successfull"})
        })
    })
})

// HOMEPAGE
app.get("/", (req, res)=>{
    const user = req.user

    if(!req.isAuthenticated()){
        return res.json({error: "you are not authenticated"})
    }
    res.json({msg:"welcome" + user?.username })
})

// Log Out
app.get("/logout", (req, res)=>{
    req.logout(function(err){
        if(err){
            return res.json(err)
        }

        res.json({msg:"log out done!!!"})
    })
})





app.listen(port, async()=>{
    await connectDB()
    console.log("server connected on port " + port)
})

