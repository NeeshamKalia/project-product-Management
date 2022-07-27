const productModel=require("../models/productModel.js")
const config = require('../utils/aws');
const validation = require('../utils/validation');


const createProduct = async function (req, res) {
  
  let Data = req.body, files = req.files;
  let {title, description, price, currencyId, currencyFormat, productImage, isFreeShipping, style, availableSizes, installments} = Data  
//validation --
if (!validation.isValidRequestBody(Data)) { return res.status(400).send({ status: false, message: "Please enter details"}) } 

if(!validation.isValid(title))  {
  return res.status(400).send({status:false, message: "Title is required"})
}
const titleAlreadyUsed = await productModel.findOne({title})
if(titleAlreadyUsed) { return res.status(400).send({ status:false, message:`${title} is already in use.Enter another title`})}
//description
if(!validation.isValid(description))  {
  return res.status(400).send({status:false, message: "needs a Description"})
}
if(!validation.isValid(price))  {
  return res.status(400).send({status:false, message: "provide product price"})     
}
if (price == 0){
            return res.status(400).send({ status: false, message: "Price of product can't be zero" })}
if (!price.match(/^\d{0,8}(\.\d{1,2})?$/)){
      return res.status(400).send({ status: false, message: "Price  you have set is not valid" })}
if(!validation.isValid(currencyId))  {
  return res.status(400).send({status:false, message: "needs currencyId"})
}
if(currencyId != "INR"){
  return res.status(400).send({status:false, message: "needs currencyFormat in INR"})
}
if(!validation.isValid(currencyId))  {
  return res.status(400).send({status:false, message: "need currencyId"})
}
if(currencyFormat != "₹"){
  return res.status(400).send({status:false, message: "need currencyId in ₹"})
}
if(!validation.isValid(style))  {
  return res.status(400).send({status:false, message: "style required"})
}
if(!validation.isValid(isFreeShipping))  {
  return res.status(400).send({status:false, message: "isFreeShipping is required"})
}
if((isFreeShipping) != 'true' && isFreeShipping != 'false' ){
  
  return res.status(400).send({status:false, message: "isFreeShipping must be a boolean type"})
}
if(installments){
   if(typeof(installments) != number  || installments < 1){
    return res.status(400).send({status:false, message: "installments must be a natural number"})
   
if(!validation.isValid(availableSizes))  {
  return res.status(400).send({status:false, message: "availableSizes are required"})
}
productImage = await config.uploadFile(files[0])

  let newData = {title, description, price, currencyId, currencyFormat, productImage: productImage
      , isFreeShipping, style, availableSizes, installments}



const savedData = await productModel.create(newData);
return res.status(201).send({ status: true, message: "product created successfully", data: savedData, });
  }

}
}

module.exports = {createProduct}