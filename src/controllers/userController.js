const userModel = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const createUser = async function (req, res) {
    try {  
      if (Object.keys(req.body).length == 0) { return res.status(400).send({ status: false, msg: "Please enter details in the request Body" }) } 
      let {fname,lname,email,profileImage,phone,password,address} = req.body;

      const saltRounds = 10;
      const encryptedPassword = await bcrypt.hash(password, saltRounds) //encrypting password by using bcrypt.
      userData = {
        fname,
        lname,
        email,
        profileImage,
        phone,
        password: encryptedPassword,
        address
    }
      let savedData = await userModel.create(userData);
      return res.status(201).send({status: true,msg: "User created successfully", data: savedData,});

    }  catch (err) {
        console.log("This is the error :", err.message);
        return res.status(500).send({ status: false, msg: "Error", error: err.message });
      }
    };


    const loginUser = async function (req, res) {
      try {
        if (Object.keys(req.body).length == 0) { return res.status(400).send({ status: false, msg: "Please enter details in the request Body" }) } 
        let userName = req.body.email;
        let password = req.body.password;
        if (!userName) { return res.status(400).send({ status: false, msg: "Please enter your email Address" }) }
        if (!password) { return res.status(400).send({ status: false, msg: "Please enter your password" }) }
        
        
        let user = await userModel.findOne({ email: userName});
        
        if (!user)
          return res.status(400).send({
            status: false,
            msg: "emailAddress is not correctly entered",
          });
        const encryptedPassword = await bcrypt.compare(password, user.password); 
        if(!encryptedPassword) { return res.status(400).send({ status: false, msg: "Please enter your password correctly" }); }

        let token = jwt.sign(
          {
            userId: user._id.toString(),
    
          },
          "functionup-radon", { expiresIn: '1d' }
        );
        res.setHeader("BearerToken", token);
        res.status(200).send({ status: true, message: 'User login successfull', data: { userId: user._id, token: token} });
      }
      catch (err) {
        console.log("This is the error :", err.message)
        res.status(500).send({ msg: "Error", error: err.message })
      }
    }

    const getUserById = async function (req, res) {

      try {
         
           let userId = req.params.userId
           userId=userId.trim()
    
           if(!userId){ return res.status(400).send({status:false,message:"UserId is required"})}
           if (!mongoose.isValidObjectId(userId)) { return res.status(400).send({ status: false, msg: "invalid userId" }) }
         
           const checkUser = await userModel.findById(userId)
    
           if (!checkUser) return res.status(404).send({ status: false, message: "No user found" })
        
    
         
    
          return res.status(200).send({ status: true, message: 'User profile details', data: checkUser });
    
      } catch (err) {
          res.status(500).send({ status: false, message: err.message });
      }
    }

    module.exports = {createUser, loginUser, getUserById};   