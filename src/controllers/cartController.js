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
const findThatCart = await cartModel.findOne({userId: userId});
if(!findThatCart){ 
    const cart = {
        userId: userId,
        items: [{productId: productId, quantity: quantity}],
        
        totalPrice: findThatProduct.price * quantity,
        totalItems: 1 
    }
    let cartCreated = await cartModel.create(cart)
    return res.status(201).send({status: true, message:"Success" , data: cartCreated}) }
//if(findThatCart){



}catch (error) {
        res.status(500).send({ status: false, message: error.message })
      }
    }


























module.exports = {createCart,}


// getCartById, updateCart, deleteCart