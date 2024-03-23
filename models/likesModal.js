const mongoose=require("mongoose");

const likesSchema=new mongoose.Schema(
    {
        comment:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Comment"
        },
       
         video:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Video" 
        },
        likedBy:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User" 
        },
        tweets:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Tweet" 
        },
    },
    {timestamps:true},
)

const Like=mongoose.model("Like",likesSchema)

module.exports=Like;