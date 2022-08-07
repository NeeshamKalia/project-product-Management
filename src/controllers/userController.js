const userModel = require('../models/userModel');
const validation = require('../utils/validation');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
//const isImage = require('is-image');
const config = require('../utils/aws');

const createUser = async function (req, res) {
      try {
        let data = req.body
      let files = req.files
      if(!validation.isValidRequestBody(data)) { return res.status(400).send({ status: false, message: "Please enter details in the request " }) } 
      
    let {fname,lname,email,profileImage,phone,password,address} = data

    //validations--
   //fname
    if(!validation.isValid(fname)) { 
      return res.status(400).send({ status: false, message: "Please enter a valid fname" }) }

    if (!/^[a-zA-Z]+$/.test(fname)) {
       return res.status(400).send({ status: false, message: "fname should alpha characters" })};
   //lname
    if(!validation.isValid(lname)) {
       return res.status(400).send({ status: false, message: "Please enter a valid lname" }) }

    if (!/^[a-zA-Z]+$/.test(lname)) {
      return res.status(400).send({ status: false, message: "lname should alpha characters" })}

    //email
    if(!validation.isValid(email)) { 
      return res.status(400).send({ status: false, message: "Please enter a valid email"})}
  //email unique check ---
    const isUniqueEmail = await userModel.findOne({ email: email });
    if(isUniqueEmail) { return res.status(400).send({status: false, message: "Please enter a unique email"})}
  //email regex check ---
  
  if (!(email.trim()).match(/^[a-zA-Z_\.\-0-9]+[@][a-z]{3,6}[.][a-z]{2,4}$/)){return res.status(400).send({status: false,message: 'invalid E-mail'})};
  
  //phone validation
   // if (!phone) { return res.status(400).send({ status: false, message: "Please enter a valid phone number" }) }
   if(!validation.isValid(phone)) { return res.status(400).send({ status: false, message: "Please enter a valid phone" }) }
   const phoneAlreadyExists = await userModel.findOne({ phone: phone })
   if(phoneAlreadyExists) { return res.status(400).send({status: false, message: "phone number already exists" }) }
  
   if (!(/^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/.test(phone))){ return res.status(400).send({status: false, message: "phone number not valid" }); }
   //password-
   if(!validation.isValid(password)) { return res.status(400).send({ status: false, message: "Please enter a valid password" }) }
   if(password.length > 15 || password.length < 8) { return res.status(400).send({status: false, message: "password should be between 15 and 8 characters" }) }
  


  if(!validation.isValidRequestBody(files)){  //files
     return res.status(400).send({status:false, message: "profileImage is required"})
  }  
  
profileImage = await config.uploadFile(files[0])
//address

if (!address) {
    return res.status(400).send({ status: false, message: "address is required" })
}

  let shippingAddressToString = JSON.stringify(address)
   address = JSON.parse(shippingAddressToString) 
 

let { shipping, billing } = data.address        //destructuring
if (!validation.isValidRequestBody(data.address)){
    return res.status(400).send({status:false,message:"No keys are present in address"})
}


if (!validation.isValidIncludes("shipping", data.address)) {  
  return res.status(400).send({ status: false, message: "shipping is required" })
}

if (typeof shipping != "object") {
  return res.status(400).send({ status: false, message: "shipping should be an object" })
}
//Shipping field validation==>
if (!validation.isValid(shipping.street)) {
  return res.status(400).send({ status: false, message: "shipping street is required" })
}
if (!validation.isValid(shipping.city)) {
  return res.status(400).send({ status: false, message: "shipping city is required" })
}

if (!/^[a-zA-Z]+$/.test(shipping.city)) {
  return res.status(400).send({ status: false, message: "city field have to fill by alpha characters" });
}

if (!validation.isValid(shipping.pincode)) {
  return res.status(400).send({ status: false, message: "shipping pincode is required" })
}
//pincode

 if (!/^\d{6}$/.test(Number(shipping.pincode))) {
  return res.status(400).send({ status: false, message: "enter valid shipping pincode" });
}
//billing address

if (!validation.isValid(billing.city)) {
  return res.status(400).send({ status: false, message: "billing city is required" })
}
if (!/^[a-zA-Z]+$/.test(billing.city)) {
  return res.status(400).send({ status: false, message: "city field have to fill by alpha characters" });
}

if (!validation.isValid(billing.pincode)) {
  return res.status(400).send({ status: false, message: "billing pincode is required" })
}

//applicable only for numeric values and extend to be 6 characters only

if (!/^[1-9][0-9]{5}$/.test(Number(billing.pincode))) {
  return res.status(400).send({ status: false, message: "Enter a valid  billing pincode"}); }
 
const saltRounds = 10;
const encryptedPassword = await bcrypt.hash(password, saltRounds) //encrypting password by using bcrypt.
userData = {
    fname,
    lname,
    email,
    profileImage,
    phone,
    password: encryptedPassword,
    address  }
  const savedData = await userModel.create(userData);
return res.status(201).send({status: true,message: "User created successfully", data: savedData,});
}

catch (err) {
  res.status(500).send({ status: false, message: err.message });
}
    
}   
//-------------------Logging user------------------------
    const loginUser = async function (req, res) {
      try {
        if (!validation.isValidRequestBody(req.body)) { return res.status(400).send({ status: false, message: "Please enter details in the request Body" }) } 
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
        res.status(200).send({ status: true, message: 'User login successful', data: { userId: user._id, token: token} });
      }
      catch (err) {
        console.log("This is the error :", err.message)
        res.status(500).send({ message: "Error", error: err.message })
      }
    }
//---------------------------------getUserById-------------------------------------------------------------------------
    const getUserById = async function (req, res) {

      try {
         
           let userId = req.params.userId
           userId=userId.trim()
    
           
         
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
      if (!validation.isValidRequestBody(req.body) && !(req.files)){ return res.status(400).send({ status: false, message: "Please enter details in the request Body" }) } 
      let userId = req.params.userId, body = req.body
      
      const findUserProfile = await userModel.findOne({_id:userId})
      if(!findUserProfile) { return res.status(404).send({ status: false, message:"User not found" }) }
      let files = req.files
      let {fname,lname,email,profileImage,phone,password,address} = body
    //validations--
    if(validation.isValidIncludes("fname", req.body)){
     //if(fname){
    
   if(!validation.isValid(fname)) { 
    return res.status(400).send({ status: false, message: "Please enter a valid fname" }) }

  if (!/^[a-zA-Z]+$/.test(fname)) {
     return res.status(400).send({ status: false, message: "fname should alpha characters" })};
    
    }
 if(validation.isValidIncludes("lname", req.body)){
  if(!validation.isValid(lname)) {
     return res.status(400).send({ status: false, message: "Please enter a valid lname" }) }

  if (!/^[a-zA-Z]+$/.test(lname)) {
    return res.status(400).send({ status: false, message: "lname should alpha characters" })}
    
  }
  if(validation.isValidIncludes("email", req.body)) {
  if(!validation.isValid(email)) { 
    return res.status(400).send({ status: false, message: "Please enter a valid email"})}
//email unique check ---
  const isUniqueEmail = await userModel.findOne({ email: email });
  if(isUniqueEmail) { return res.status(400).send({status: false, message: "Please enter a unique email"})}
//email regex check ---

if (!(email.trim()).match(/^[a-zA-Z_\.\-0-9]+[@][a-z]{3,6}[.][a-z]{2,4}$/)){return res.status(400).send({status: false,message: 'invalid E-mail'})};
}

if(validation.isValidIncludes("phone", req.body))
 {
 if(!validation.isValid(phone)) { return res.status(400).send({ status: false, message: "Please enter a valid phone" }) }
 const phoneAlreadyExists = await userModel.findOne({ phone: phone })
 if(phoneAlreadyExists) { return res.status(400).send({status: false, message: "phone number already exists" }) }

 if (!(/^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/.test(phone.trim()))){ return res.status(400).send({status: false, message: "phone number not valid" }); }
 }
 
 if(validation.isValidIncludes("password", req.body)){
if(password.includes(" ")){return res.status(400).send({status: false, message: "password contains invalid spaces" }); }
 if(!validation.isValid(password)) { return res.status(400).send({ status: false, message: "Please enter a valid password" }) }
 if(password.length > 15 || password.length < 8) { return res.status(400).send({status: false, message: "password should be between 15 and 8 characters" }) }
 const saltRounds = 10;
 var encryptedPassword = await bcrypt.hash(password, saltRounds) //encrypting password by using bcrypt.
 
 }
 if (files) {
  if (validation.isValidRequestBody(files)) {
      if (!(files && files.length > 0)) {
          return res.status(400).send({ status: false, message: "please provide profile image" })
      }
      var updatedProfileImage = await config.uploadFile(files[0])
      
  }
  
}




//address


          if (validation.isValidIncludes("address", req.body)) {
            if (!validation.isValid(address)) { return res.status(400).send({ status: false, message: "Please enter a valid address" }) }
            let shippingAddressToString = JSON.stringify(address)
            address = JSON.parse(shippingAddressToString) 
            if (typeof address != "object") {
              //console.log(typeof address)
              return res.status(400).send({ status: false, message: "address should be an object" }) }
        
            if (validation.isValidRequestBody(address)) {
              if (validation.isValidIncludes("shipping", req.body.address)) {
                  if (!validation.isValid(address.shipping)) {return res.status(400).send({ status: false, message: "shipping should be  object" })}
                  //console.log(address.shipping);
                  if (typeof address.shipping != "object") {
                    return res.status(400).send({ status: false, message: "shipping must be an object" }) }
                    if (validation.isValidIncludes("street", req.body.address.shipping)) {
                      //console.log(address.shipping.street)
                        if (!validation.isValid(address.shipping.street)) {
                            return res.status(400).send({ status: false, message: " Invalid request parameters. Please provide shipping address's Street" });
                        }
                    }
                    if (validation.isValidIncludes("city", req.body.address.shipping)) {
                      //console.log(address.shipping.city);
                        if (!validation.isValid(address.shipping.city)) {
                            return res.status(400).send({ status: false, message: " Invalid request parameters. Please provide shipping address's City" });
                        }
                        if (!/^[a-zA-Z]+$/.test(address.shipping.city)) {
                          return res.status(400).send({ status: false, message: "city field have to fill by alpha characters" });
                         }

                    }
                    if (validation.isValidIncludes("pincode", req.body.address.shipping)) {
                        if (!validation.isValid(address.shipping.pincode)) {
                            return res.status(400).send({ status: false, message: " Invalid request parameters. Please provide shipping address's pincode" });
                        }
                        if (!/^\d{6}$/.test(address.shipping.pincode)) {
                          return res.status(400).send({ status: false, message: "enter valid shipping pincode"});
                        } 
                    }
        
                    //using var to use these variables outside this If block.
                    var shippingStreet = address.shipping.street
                    var shippingCity = address.shipping.city
                    var shippingPincode = address.shipping.pincode
                }
            } else {
                return res.status(400).send({ status: false, message: " Invalid request parameters- Shipping address" });
            }
        }
          if (validation.isValidIncludes("address", req.body)) {
            if (typeof address != "object") {
              //console.log(typeof address)
              return res.status(400).send({ status: false, message: "address should be an object" }) }
          
        
            if (validation.isValidRequestBody(address)) {
              
                if (validation.isValidIncludes("billing", req.body.address)) {
                  if (typeof address.billing != "object") {
                    return res.status(400).send({ status: false, message: "billing address should be an object" }) }
                    if (!validation.isValid(address.billing)) {return res.status(400).send({ status: false, message: "billing should be  object" })}

                    if (validation.isValidIncludes("street", req.body.address.billing)) {
                      
                        if (!validation.isValid(address.billing.street)) {
                            return res.status(400).send({ status: false, message: " Invalid request parameters. Please provide billing address's Street" });
                        }
                    }
                    if (validation.isValidIncludes("city", req.body.address.billing)) {
                        if (!validation.isValid(address.billing.city)) {
                            return res.status(400).send({ status: false, message: " Invalid request parameters. Please provide billing address's City" });
                        }
                        if (!/^[a-zA-Z]+$/.test(address.billing.city)) {
                          return res.status(400).send({ status: false, message: "city field have to fill by alpha characters" });
                         }
                    }
                    if (validation.isValidIncludes("pincode", req.body.address.billing)) {
                        if (!validation.isValid(address.billing.pincode)) {
                            return res.status(400).send({ status: false, message: " Invalid request parameters. Please provide billing address's pincode" });
                        }
                        if (!/^\d{6}$/.test(address.billing.pincode)) {
                          return res.status(400).send({ status: false, message: "enter valid billing pincode"});
                        } 
                    }
        
                    //using var to use these variables outside this If block.
                    var billingStreet = address.billing.street
                    var billingCity = address.billing.city
                    var billingPincode = address.billing.pincode
                }
            } else {
                return res.status(400).send({ status: false, message: " Invalid request parameters. Billing address cannot be empty" });
            }
        }  

let changedProfile = await userModel.findOneAndUpdate({_id: userId},
       { $set: {fname: fname, lname: lname, email: email, password: encryptedPassword, phone: phone,profileImage: updatedProfileImage,
        'address.shipping.street': shippingStreet,
      'address.shipping.city': shippingCity,
      'address.shipping.pincode': shippingPincode,
      'address.billing.street': billingStreet,
      'address.billing.city': billingCity,
      'address.billing.pincode': billingPincode 
        
       }}
         ,
      {new: true})
      return res.status(200).send({ status: true, message: "User profile updated", data: changedProfile})
      } catch (err) {
        res.status(500).send({ status: false, message: err.message });
    }
  }



  module.exports = {createUser, loginUser, getUserById, updateUserProfile};   