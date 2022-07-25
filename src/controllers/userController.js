const userModel = require('../models/userModel');
const validation = require('../utils/validation');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const createUser = async function (req, res) {
    try {  
      if (!validation.isValidRequestBody(req.body)) { return res.status(400).send({ status: false, message: "Please enter details in the request Body" }) } 
    let {fname,lname,email,profileImage,phone,password,address} = req.body;

    //validations--

    if(!validation.isValid(fname)) { return res.status(400).send({ status: false, message: "Please enter a valid fname" }) }
    if(!validation.isValid(lname)) { return res.status(400).send({ status: false, message: "Please enter a valid lname" }) }
    if(!validation.isValid(email)) { return res.status(400).send({ status: false, message: "Please enter a valid email"})}

    //email unique check ---

    const isUniqueEmail = await userModel.findOne({ email: email });
    if(isUniqueEmail) { return res.status(400).send({status: false, message: "Please enter a unique email"})}
    //email regex check ---
    if (!email.match(/^[a-zA-Z_\.\-0-9]+[@][a-z]{3,6}[.][a-z]{2,4}$/))return res.status(400).send({status: false,message: 'invalid E-mail'})
    //phone validation
   // if (!phone) { return res.status(400).send({ status: false, message: "Please enter a valid phone number" }) }
    if(!validation.isValid(phone)) { return res.status(400).send({ status: false, message: "Please enter a valid phone" }) }
    const phoneAlreadyExists = await userModel.findOne({ phone: phone })
    if(phoneAlreadyExists) { return res.status(400).send({status: false, message: "phone number already exists" }) }

    if (!(/^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/.test(phone))){ return res.status(400).send({ message: "phone number not valid" }); }
    //password-
    if(!validation.isValid(password)) { return res.status(400).send({ status: false, message: "Please enter a valid password" }) }
    if(password.length > 15 || password.length < 8) { return res.status(400).send({status: false, message: "password should be between 15 and 8 characters" }) }
  //address
    if (!address) {
      return res.status(400).send({ status: false, message: "address is required" })
  }
  
  if (typeof  address != "object") {
      return res.status(400).send({ status: false, message: "address should be an object" })
  }
  data.address = JSON.parse(data.address)


  // this validation will check the address is in the object format or not

  
  let { shipping, billing } = data.address        //destructuring
  if(Object.keys(data.address).length==0){
      return res.status(400).send({status:false,message:"No keys are present in address"})
  }


  //Shipping field validation==>

  if (!shipping) {
      return res.status(400).send({ status: false, message: "shipping is required" })
  }

  if (typeof shipping != "object") {
      return res.status(400).send({ status: false, message: "shipping should be an object" })
  }

  if (!isValid(shipping.street)) {
      return res.status(400).send({ status: false, message: "shipping street is required" })
  }

  if (!isValid(shipping.city)) {
      return res.status(400).send({ status: false, message: "shipping city is required" })
  }

  if (!/^[a-zA-Z]+$/.test(shipping.city)) {
      return res.status(400).send({ status: false, message: "city field have to fill by alpha characters" });
  }

  if (!isValid(shipping.pincode)) {
      return res.status(400).send({ status: false, message: "shipping pincode is required" })
  }


  //pincode

  if (!/^\d{6}$/.test(shipping.pincode)) {
      return res.status(400).send({ status: false, message: "plz enter valid shipping pincode" });
  }


  //Billing Field validation==>

  if (!billing) {
      return res.status(400).send({ status: false, message: "billing is required" })
  }

  if (typeof billing != "object") {
      return res.status(400).send({ status: false, message: "billing should be an object" })
  }

  if (!isValid(billing.street)) {
      return res.status(400).send({ status: false, message: "billing street is required" })
  }

  if (!isValid(billing.city)) {
      return res.status(400).send({ status: false, message: "billing city is required" })
  }
  if (!/^[a-zA-Z]+$/.test(billing.city)) {
      return res.status(400).send({ status: false, message: "city field have to fill by alpha characters" });
  }

  if (!isValid(billing.pincode)) {
      return res.status(400).send({ status: false, message: "billing pincode is required" })
  }

  //applicable only for numeric values and extend to be 6 characters only

  if (!/^\d{6}$/.test(billing.pincode)) {
      return res.status(400).send({ status: false, message: "Enter a valid  billing pincode"});

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
      return res.status(201).send({status: true,message: "User created successfully", data: savedData,});

    }
    }  catch (err) {
        console.log("This is the error :", err.message);
        return res.status(500).send({ status: false, message: "Error", error: err.message });
      }
    };


    const loginUser = async function (req, res) {
      try {
        if (Object.keys(req.body).length == 0) { return res.status(400).send({ status: false, message: "Please enter details in the request Body" }) } 
        let userName = req.body.email;
        let password = req.body.password;
        if (!userName) { return res.status(400).send({ status: false, message: "Please enter your email Address" }) }
        if (!password) { return res.status(400).send({ status: false, message: "Please enter your password" }) }
        
        
        let user = await userModel.findOne({ email: userName});
        
        if (!user)
          return res.status(400).send({
            status: false,
            message: "emailAddress is not correctly entered",
          });
        const encryptedPassword = await bcrypt.compare(password, user.password); 
        if(!encryptedPassword) { return res.status(400).send({ status: false, message: "Please enter your password correctly" }); }

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
        res.status(500).send({ message: "Error", error: err.message })
      }
    }

    const getUserById = async function (req, res) {

      try {
         
           let userId = req.params.userId
           userId=userId.trim()
    
           if(!userId){ return res.status(400).send({status:false,message:"UserId is required"})}
           if (!mongoose.isValidObjectId(userId)) { return res.status(400).send({ status: false, message: "invalid userId" }) }
         
           const checkUser = await userModel.findById(userId)
    
           if (!checkUser) return res.status(404).send({ status: false, message: "No user found" })
          //if (checkUser._id.toString() != req.userId) return res.status(401).send({ status: false, message: "unauthorized" })
    
         
    
          return res.status(200).send({ status: true, message: 'User profile details', data: checkUser });
    
      } catch (err) {
          res.status(500).send({ status: false, message: err.message });
      }
    }

//--------Update User Profile--------------------////

  const updateUserProfile = async function (req, res) {
    try {
      if (Object.keys(req.body).length == 0) { return res.status(400).send({ status: false, message: "Please enter details in the request Body" }) } 
      let userId = req.params.userId  
      const findUserProfile = await userModel.findOne({_id:userId})
      if(!findUserProfile) { return res.status(404).send({ status: false, message:"User not found" }) }
    // --authorization
  
    
    //if(findUserProfile._id != req.userId) { return res.status(404).send({ status: false, message: "Unauthorized access" }) }

    let {fname, email, password, phone, address, profileImage} = req.body
    let changedProfile = await userModel.findOneAndUpdate({_id: userId},
      { $set: {fname: fname, email: email, password: password, phone: phone, address: address, profileImage: profileImage } },
      {new: true})
      return res.status(200).send({ status: true, message: "User profile updated", data: changedProfile})
      } catch (err) {
        res.status(500).send({ status: false, message: err.message });
    }
  }
    module.exports = {createUser, loginUser, getUserById, updateUserProfile};   