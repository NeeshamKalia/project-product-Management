const cartModel=require("../models/cartModel.js");
const productModel=require("../models/productModel.js");
const userModel = require("../models/userModel.js");
const config = require('../utils/aws');
const validation = require('../utils/validation');
function isNum(val){
  return !isNaN(val) 
}


const createCart = async function (req,res){
    try{
        const userId = req.params.userId
        const body = req.body
    let {productId, quantity} = body 
    quantity = Number(quantity)

if(!validation.isValidRequestBody(body)){ return res.status(400).send({ status: false, message: "Please enter a valid body" }) }
if(!validation.isValidObjectId(productId)){ return res.status(400).send({ status: false, message: "Please enter a valid product id" }) }
if(!validation.isValid(quantity)){ return res.status(400).send({ status: false, message: "Please enter a valid quantity" }) }
//if user exists
const findThatUser = await userModel.findOne({_id: userId}) 
if(!findThatUser){ return res.status(404).send({ status: false, message: "user not found" }) }
// if product exists
const findThatProduct = await productModel.findOne({_id: productId, isDeleted: false})
if(!findThatProduct) { return res.status(404).send({ status: false, message: "product not found or deleted" }); }
//if cart already exists
const findThatCart = await cartModel.findOne({userId: userId, isDeleted: false})
if(!findThatCart){ 
  let item = [];
  
  let productin = {productId: findThatProduct._id, quantity: quantity}
  item.push(productin)
    const cart = {
        userId: userId,
        items: item,
        
        totalPrice: findThatProduct.price * quantity,
        totalItems: 1 
    }

    let cartCreated = await cartModel.create(cart)
    let finalresult=await cartModel.findOne({_id:cartCreated._id}).select({"items._id":0})
    return res.status(201).send({status: true, message:"Success" , data: finalresult}) }
if(findThatCart){
    let price = findThatCart.totalPrice + (quantity * findThatProduct.price)
    let existedItems = findThatCart.items
    for(let i in existedItems){
        if(existedItems[i].productId.toString() === productId){
            existedItems[i].quantity += quantity
        let updatedCart = {items: existedItems, totalPrice: price, totalItems: existedItems.length}
        
        
        let newCart = await cartModel.findOneAndUpdate({_id:findThatCart._id, userId: userId },updatedCart, { new: true }).select({"items._id":0})
        //let finalresult=await cartModel.findOne({_id:newCart._id}).select({"items._id":0})  
        return res.status(201).send({status: true, message:"Product added Successfully", data: newCart});
    }
}
existedItems.push({productId: productId, quantity: quantity});
let updateCart = {items: existedItems, totalPrice: price, totalItems: existedItems.length}
let finalData = await cartModel.findOneAndUpdate({_id: findThatCart._id},updateCart,{new: true});
return res.status(201).send({status: true, message:"Product added successfully", data: finalData});
      
                }
}catch (error) {
        res.status(500).send({ status: false, message: error.message })
      }
    }

//update Cart----------------------------------------------------

const updateCart = async function (req, res) {
    try{
      
      let userId = req.params.userId
      let Data = req.body
      let {productId, cartId, removeProduct} = Data
    if(!validation.isValidRequestBody(Data)){return res.status(400).send({status: false, message: 'invalid request body'})}

    const findUser = await userModel.findOne({_id:userId, isDeleted:false})
    if(!findUser){return res.status(404).send({status: false, message: 'User not found'})};

    if(!validation.isValidObjectId(productId)){return res.status(400).send({status: false, message: 'Invalid product ID'})};

      const product = await productModel.findOne({_id:productId, isDeleted:false});
      if(!product){
        return res.status(400).send({status: false, message: "Product doesn't exists or deleted"})}
if(cartId){
     if(!validation.isValidObjectId(cartId)){return res.status(400).send({status: false, message: 'Invalid cart ID'})};
    const findThatCart = await cartModel.findOne({userId: userId});
    if(!findThatCart){ return res.status(400).send({status: false, message: "this cart  doesn't exists"})}
  }

  if(!validation.isValid(removeProduct)){return res.status(400).send({status: false, message: "removeProduct invalid"})}
  if(!(isNum(removeProduct)))return res.status(400).send({status: false, message: "removeProduct must be number"})
  if(!((removeProduct == 1) || (removeProduct == 0)))return res.status(400).send({status: false, message: "removeProduct can be 0 or 1"})

  //findThatCart.productId != productId => product doesn't exist in cart
  if(findThatCart.productId.toString() != productId)return res.status(404).send({status: false, message: "Product does not exist in cart"}) 
if(removeProduct === 0){
  //let newAmount = findThatCart.totalPrice - product.price * findThatCart.items[(items.indexOf(quantity)]

}




    }catch (error) {
        res.status(500).send({ status: false, message: error.message })
      }
    }
  

//------getCartById-----------------------------------------------------------------------

const getCartById = async function(req,res){
    try{
        let userId = req.params.userId
         const findUser = await userModel.findOne({_id:userId, isDeleted:false})
        if(!findUser){return res.status(404).send({status: false, message: 'User not found'})};
     
    const validCart = await cartModel.findOne({userId: userId}).select({"items._id":0})
    if(!validCart){return res.status(400).send({status: false, message: 'cart not found'});}
    
    return res.status(200).send({status: true, message: "Success", data: validCart})
    }catch (error) {
        res.status(500).send({ status: false, message: error.message })
      }
    }
//------------------delete Cart-------------------------------------

const deleteCart = async function(req,res){
    try{
        let userId = req.params.userId;
        const findUser = await userModel.findOne({_id:userId, isDeleted:false})
        if(!findUser){return res.status(404).send({status: false, message: 'User not found'})};  
    
    const validCart = await cartModel.findOne({userId: userId, totalPrice: {$gt:0}})
    if(!validCart){return res.status(404).send({status: false, message: 'cart not found or deleted'});}
    console.log(validCart);
    const cartDelete = await cartModel.findOneAndUpdate({userId: userId}, {$set: {totalPrice: 0, totalItems: 0, items:[]}}, {new: true})
   return res.status(200).send({status: true, message: "Cart deleted Successfully"})




    }catch (error) {
        res.status(500).send({ status: false, message: error.message })
      }
    }






















module.exports = {createCart,getCartById, deleteCart}


// , updateCart, 