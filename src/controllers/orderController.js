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
    if(!validation.isValid(cancellable)){return res.status(status).send({status: false, message: "cancellable invalid"})}
        if(typeof cancellable != 'boolean') {return res.status(400).send({status: false, message: "cancellable must be boolean"})}
   }
   if(status){
    if(!validation.isValid(status)){return res.status(status).send({status: false, message: "status invalid"})}
    if(!(status === 'pending' || status === 'completed'  || status === 'cancelled')){return res.status(400).send({status: false, message: "status should be pending or completed or cancelled"})}
   }
   if(!cartId){
    return res.status(400).send({status: false, message: "cartId is required"})
   }
   if(!validation.isValidObjectId(cartId)){return res.status(400).send({status: false, message: "cartId invalid"})}

   const cartLookUp = await cartModel.findOne({_id: cartId, userId: userId}).select({"items._id":0});
   if(!cartLookUp) {return res.status(400).send({status : false, message: "Cart doesn't exist or not belonging to this user"});}
   
   if(cartLookUp.items.length === 0) {return res.status(400).send({status : false, message: "no items found in that cart"});}

//quantity = itemsarray's =  object.quantity === all add.
let adding =(a,b) => a + b;
let totalQuantity = cartLookUp.items.map(x => x.quantity).reduce(adding)
  
const order = {
    userId: userId,
    cancellable,
    status,
    items: cartLookUp.items,
    totalItems : cartLookUp.totalItems,
    totalPrice: cartLookUp.totalPrice,
    totalQuantity: totalQuantity

}
let finalData = await orderModel.create(order)
let clearCart = await cartModel.findOneAndUpdate({userId: userId}, {$set:{items: [], totalPrice: 0, totalItems:0}})
let finalresult=await orderModel.findOne({userId: userId}).select({"items._id":0})
return res.status(200).send({status: true, message: "Success", data: finalresult})
    } catch (error) {
        res.status(500).send({ status: false, message: error.message })
      }
    }

//update an order
const orderUpdate = async (req,res) => {
    try{
      let userId = req.params.userId;
      let body = req.body;
      if(!validation.isValidRequestBody(body)){return res.status(400).send({status: false, message: "Please enter a valid request body."});}
      let {orderId, status} = body;
      if(!orderId){return res.status(400).send({status: false   , message: "Please enter a valid order ID."});} 
      if(!validation.isValidObjectId(orderId)){return res.status(400).send({ status: false, message: "invalid order ID." });}
      if(!status){return res.status(400).send({status: false    , message: "Please enter a valid status."});}
     if(!validation.isValid(status)){return res.status(400).send({status: false , message: "Please enter a valid status."});}
     if(!(status === 'pending' || status === 'completed'  || status === 'cancelled')){return res.status(400).send({status: false, message: "status should be pending or completed or cancelled"})}
    

      let user = await userModel.findOne({_id: userId});  
      if(!user){return res.status(404).send({status: false   , message: "User not found."});}
      let order = await orderModel.findOne({_id: orderId}); 
      if(!order){return res.status(404).send({status: false , message: "Order not found."});}   
      if(order.userId != userId){return res.status(400).send({status: false , message: "order not matching user."});}
      if(order['cancellable'] == 'true'){
        if(order['status'] == 'pending'){
            let statusUpdate = await orderModel.findOneAndUpdate({_id: orderId}, {$set: {status: status}}, {new: true}).select({"items._id":0});
            return res.status(200).send({ status: false, message:"Success", data: statusUpdate});
        } 
        if(order['status'] == 'completed'){return res.status(400).send({status: false   , message: "order already completed."});}
        if(order['status'] == 'cancelled'){return res.status(400).send({status: false , message: "order already cancelled."});}
    }
    if(order['status'] == 'completed'){
        if(status){return res.status(400).send({status: false , message: "order completed already."});}
    }
    if(order['status'] == 'cancelled'){
        if(status){return res.status(400).send({status: false , message: "order cancelled already."});}
    }

    if(order['status'] == 'pending'){
          if(status){
            if(status == 'completed'){
                const statusUpdate = await orderModel.findOneAndUpdate({_id: orderId}, {$set:{status: status}},{new: true}).select({"items._id":0});
                return res.status(200).send({status: true, message: "Success", data: statusUpdate});
          }
          if(status == 'pending'){return res.status(400).send({ status: false, message: "order already in pending"});}
          if(status == 'cancelled'){
            if(order['cancellable'] == 'false'){return res.status(400).send({ status: false, message: "order is already cancelled"});}
            else{const Update = await orderModel.findOneAndUpdate({_id: orderId}, {$set:{status: status}},{new: true});
            return res.status(200).send({status: true, message: "Success", data: Update})}; 
          }
   

    }
}

    }catch (error) {
        res.status(500).send({ status: false, message: error.message })
      }
    }








    module.exports = {orderCreate,orderUpdate}