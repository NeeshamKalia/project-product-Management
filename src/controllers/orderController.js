const userModel = require('../models/userModel');
const cartModel = require('../models/cartModel');
const orderModel = require('../models/orderModel');
const validation = require('../utils/validation');


const orderCreate = async (req,res) => {
    try {
        const userId = req.params.userId;
        let body = req.body;

    if(!validation.isValidRequestBody(body)) {return res.status(400).send({status: false, message: "invalid req body"})}
    const {cartId, cancellable, status } = body
    //if(!validation.isValidObjectId(userId)) {return res.status(400).send({status: false, message: "invalid user id"})}
   let userExists = await userModel.findOne({_id: userId})
   if(!userExists) {return res.status(404).send({status: false, message: "user not found"})}
   if(cancellable) {
        if(typeof cancellable != 'boolean') {return res.status(401).send({status: false, message: "cancellable must be boolean"})}
   }
   if(status){
    if(!validation.isValid(status)){return res.status(status).send({status: false, message: "status invalid"})}
    if(!(status === 'pending' || status === 'completed'  || status === 'cancelled')){return res.status(status).send({status: false, message: "status should be Pending or Completed or cancelled"})}
   }
   if(!cartId){
    return res.status(400).send({status: false, message: "cartId is required"})
   }
   if(!validation.isValidObjectId(cartId)){return res.status(400).send({status: false, message: "cartId invalid"})}

   const cartLookUp = await cartModel.findOne({_id: cartId, userId: userId});
   if(!cartLookUp) {return res.status(400).send({status : false, message: "Cart not belonging to this user"});}
   if(cartLookUp.items.length === 0) {return res.status(200).send({status : true, message: "no items found in that cart"});}


  
const order = {
    userId: userId,
    cancellable,
    status,
    totalItems : cartLookUp.items.length,
    totalPrice: cartLookUp.totalPrice,
    totalQuantity: cartLookUp.totalQuantity

}


    } catch (error) {
        res.status(500).send({ status: false, message: error.message })
      }
    }