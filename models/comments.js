const  mongoose = require('mongoose');
const commentsSchema=new mongoose.Schema({
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    content:{
        type:String,
        required: true,
        trim:true,
    },
    video:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Video"
    }

},
{timeseries:true})

const Comment=mongoose.model("Comment",commentsSchema);
module.exports=Comment;