const express = require("express");
const router  = express.Router();
const User = require("../models/User");
const jwt = require('jsonwebtoken');
const protect = require('../middlewares/authMiddleware');


router.post('/register',async (req,res)=>{
  try{
    const {firstName, lastName, phone, email,password,address,} = req.body;
    
    //check if user already exist
    const existingUser = await User.findOne({email});
    if(existingUser){
      return res.status(400).json({message: "User already exists"});
    }
    
    //create a new user
    const newUser = new User({firstName, lastName,phone, email, password, address});
    await newUser.save();

    res.status(201).json({meassage: 'User registered successfully', user:newUser});
  }catch(error){
    console.log(error);
    res.status(500).json({message: "Server error"});
  }
});

router.post('/login', async (req,res)=>{
  try{
    const {email,password} = req.body;

    //Find user
    const user = await User.findOne({email});
    if(!user || user.password !== password){
      return res.status(400).json({message: "invalid credintials"});
    }

  
    

    //Token for security(we do not need to enter password for each request or send the pass in the cookie each time, so we will send a token instead)
    const token = jwt.sign(
      { userId: user._id, email: user.email }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );
    console.log(token);
   

    res.json({message: "Login successful", user, token});
  }catch(error){
    console.log(error);
    res.status(500).json({message: 'Server error'});
  }

});

router.get('/profile',protect, async (req,res)=>{
  try {
    //execlude password :)
    const user = await User.findById(req.user.userId).select('-password');
    if(user){
      res.json(user);
    }else{
      res.status(404).json({message: 'User not found'});
    }
  }catch(error){
    console.log(error);
    res.status(500).json({message: 'Server error'});
  }
});

router.put('/profile',protect, async (req,res)=>{
  try{
    const user = await User.findById(req.user.userId);

    if(user){
      //updates if any of these are provided
      user.firstName = req.body.firstName || user.firstName;
      user.lastName = req.body.lastName || user.lastName;
      user.phone = req.body.phone || user.phone;
      user.address = req.body.address || user.address;
      user.email = req.body.email || user.email;

      if(req.body.password){
        user.password = req.body.password;
      }
      const updatedUser = await user.save();

      res.json({
        message: "profile updated successfully",
        user: updatedUser
      });
    }else {
      res.status(404).json({message: "User not found"});
    }
  }catch(error){
    console.error(error);
    res.status(500).json({message: "Server error"});
  }
});


module.exports = router;