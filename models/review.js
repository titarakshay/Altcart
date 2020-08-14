var mongoose=require('mongoose');
var Schema= mongoose.Schema;
var reviewSchema= new Schema({
    content:{
        type:String,
        required:true
    },
    productId:{
        type:Schema.Types.ObjectId,
        ref:"Product"
    },
    user:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    likes:{
        type:Number,
        default:0
    }
    
},{timestamps:true})


module.exports= mongoose.model("Review",reviewSchema)