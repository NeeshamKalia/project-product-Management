const mongoose = require('mongoose');

//checking validation
const isValid = function (value) {
    if(value === "") {return false}
    if( typeof value === 'undefined' || value === null) { return false; }
    if( typeof value    === 'string' && value.trim().length === 0) { return false; } 
    return true;}

const isValidObjectId = function (value) {
    return mongoose.isValidObjectId(value);
}

const isValidRequestBody = function (value) {
    return Object.keys(value).length > 0;
}

const validString = function (value) {  
    if (typeof value === 'string' && value.trim().length === 0) { return false; }
    return true;
}
const isValidIncludes=function(value,requestBody){
    return Object.keys(requestBody).includes(value)
}


module.exports = {isValid, isValidRequestBody, isValidObjectId, validString, isValidIncludes};


/* 
if (address) {
  


    if (typeof  address != "object") {
      return res.status(400).send({ status: false, message: "address should be an object" })
    }
    //data.address = JSON.parse(data.address)
    
    
    // this validation will check the address is in the object format or not
    
    
    let { shipping, billing } = data.address        //destructuring
    if (!validation.isValidRequestBody(data.address)){
      return res.status(400).send({status:false,message:"No keys are present in address"})
    }
    if (shipping) {
    
    
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
    
    if (!/^\d{6}$/.test(shipping.pincode)) {
    return res.status(400).send({ status: false, message: "plz enter valid shipping pincode" });
    }}
    //billing address
    
    if (billing) {
    
    
    
    if (typeof billing != "object") {
    return res.status(400).send({ status: false, message: "billing should be an object" })
    }
    //Billing Field validation==>
    if (!validation.isValid(billing.street)) {
    return res.status(400).send({ status: false, message: "billing street is required" })
    }
    
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
    
    if (!/^\d{6}$/.test(billing.pincode)) {
    return res.status(400).send({ status: false, message: "Enter a valid  billing pincode"}); }}} */