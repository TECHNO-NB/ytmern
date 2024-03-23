const asyncHandler = require("../utils/asyncHandler");
const  Subscription=require("../models/subscriptionsModal")
const ApiError= require("../utils/apiError");
const ApiResponse=require("../utils/apiResonse");


exports.subscriptionsControler=asyncHandler(async(req,res)=>{
   const {subscriber,channel}=req.body;
   if(!subscriber || ! channel){
      throw new ApiError(400,"SomeThing Went Wrong");
   }
  const subscribed=await Subscription.create({
      subscriber,
      channel
   })
   if(!subscribed){
      throw new ApiError("Error In Subscriptions")
   }

   res
   .status(200)
   .json(new ApiResponse(200,subscribed,"Subscribed Successfully"));

})