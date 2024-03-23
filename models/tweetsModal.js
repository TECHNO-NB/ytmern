const  mongoose = require('mongoose');
const tweetsSchema=new mongoose.Schema({
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    content:{
        type:String,
        required: true,
        trim:true,
    }

},
{timeseries:true})

const Tweet=mongoose.model("Tweet",tweetsSchema);
module.exports=Tweet;
