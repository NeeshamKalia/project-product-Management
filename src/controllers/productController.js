const productModel=require("../models/productModel.js")
const config = require('../utils/aws');
const validation = require('../utils/validation');
function isNum(val){
  return !isNaN(val) 
}

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
//console.log(typeof (installments))
  if (isNum(installments) === true){
     if(installments <= 1){
    return res.status(400).send({status:false, message: "number must be more than 1"})}
     }
  else {return res.status(400).send({status:false, message: "installments  be a natural number, more than 1"})}

if(!validation.isValid(availableSizes))  {return res.status(400).send({status:false, message: "required availableSizes "})}

sizes = availableSizes.split(',').map(a => a.trim())

 for(let i = 0; i < sizes.length; i++) {
    if(!(["S", "XS","M","X", "L","XXL", "XL"] ).includes(sizes[i])){
      return res.send({status: false, message: "sizes should be from S, XS,M,X,L,XXL, XL"})
    }
 }

if(!validation.isValidRequestBody(files)){
  return res.status(400).send({status:false, message: "productImage is required"})
}
if(files.length < 0){return res.status(400).send({status:false, message: "productImage needed" })} 
productImage = await config.uploadFile(files[0])
let newData = {title, description, price, currencyId, currencyFormat, productImage: productImage
  , isFreeShipping, style, availableSizes, installments}



const savedData = await productModel.create(newData);
  return res.status(201).send({ status: true, message: "product created successfully", data: savedData, });
    }
 //-------------GetProducts--------------------------------------------

const getProducts = async function (req, res) {
      try {
          
    const queryData = req.query
          
    if (!validation.isValidRequestBody(req.query)) { return res.status(400).send({ status: false, message: "Please enter details"}) }
    let filter = { isDeleted: false }
    let { size,name,priceGreaterThan,priceLessThan,priceSort} = queryData
    
  if(name){
    if(!validation.isValid(name)){
      return res.status(400).send({status: false, message: "Please enter name correctly"})
    }
    filter['title'] = {}
    filter['title']['$regex'] = name;
    filter['title']['$options'] = 'i'
  } 
  if(size){
    if(!validation.isValid(size)){ return res.status(400).send({ status: false, message: "Please enter a valid size" }) }
    filter['availableSize'] = size;
  }
  if(priceGreaterThan){
    if(!validation.isValid(priceGreaterThan)){return res.status(400).send({ status: false, message: "Please enter a price greater than" }) }
    if(!(isNum(priceGreaterThan))){return res.status(400).send({ status: false, message: "Please enter a number in priceGreaterThan" })}
    if(!(filter.hasOwnProperty('price'))){
      filter['price'] = {}   
    }
    filter['price']['$gt'] = Number(priceGreaterThan)
    
  

  }
  if(priceLessThan){
    if(!validation.isValid(priceLessThan)){return res.status(400).send({ status: false, message: "Please enter a valid priceLessThan" }) }
    if(!(isNum(priceLessThan))){return res.status(400).send({ status: false, message: "Please enter a number in priceGreaterThan"})}
    if(!(filter.hasOwnProperty('price'))){
      filter['price'] = {}
    }
    
  filter['price']['$lt'] = Number(priceLessThan);
  }
  if(priceSort){
  if(!(priceSort == 1  || priceSort == -1)){
    return res.status(404).send({ status: false, message: "Price sort can be only 1 or -1" });
  } }
    
  let Products = await productModel.find(filter).sort({price: priceSort})
  if (Products.length == 0) {
    return res.status(404).send({ status: false, message: "No products found" })
}  
return res.status(200).send({ status: true, message: "Success", data: Products })    
} catch (error) {
  res.status(500).send({ status: false, message: error.message })
}
}    
    
//----------------GetProductById----------------------------------
const productById  = async function(req,res) {
  try{
    let productId = req.params.productId
    if (!(validation.isValidObjectId(productId))){
      return res.status(400).send({status: false, message: "productId not valid"})
    }
    const product = await productModel.findOne({_id: productId, isDeleted: false})
    if(!product){ return res.status(404).send({status: false, message: "Product not found"})  }
    return res.status(200).send({status: true,message: "Success", data: product})
  }catch (error) {
    res.status(500).send({ status: false, message: error.message })
  }
}
//================update product =================  

const updateProduct = async function(req, res) {
  try {
    let product = await productModel.findOne({_id: req.params})
    if(!product){ return res.status(404).send({status: false, message: "Product not found"}) }
  }catch (error) {
    res.status(500).send({ status: false, message: error.message })
  }
}

    
    
          
//===== delete Product --------

const deleteProduct = async function(req, res) {  
  try{
    let productId = req.params.productId
    if (!(validation.isValidObjectId(productId))){
      return res.status(400).send({status: false, message: "productId not valid"})
    }
    let product = await productModel.findOne({_id: productId, isDeleted: false})
    if(!product) {
      return res.status(404).send({status: false, message: "Product not found or already deleted"})
    }
   let deleteProduct = await productModel.findOneAndUpdate({_id: productId},
    {$set: {isDeleted: true, deletedAt: Date.now()}},
    {new: true})
  return res.status(200).send({status: true, message: "Product deleted successfully"})
  }catch (error) {
    res.status(500).send({ status: false, message: error.message })
  }
}
          
          
      







  





module.exports = {createProduct, getProducts, productById, updateProduct, deleteProduct}