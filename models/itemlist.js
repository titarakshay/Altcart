var mongoose= require("mongoose");
var Schema=mongoose.Schema;
var itemlistSchema=new Schema({
    item:{
        type:Schema.Types.ObjectId,
        ref:"Product"
    },
    qty:{
        type:Number,
        default:0
    },
    cart:{
        type:Schema.Types.ObjectId,
        ref:"Cart"
    }
},{timestamps:true})


module.exports=mongoose.model("Itemlist",itemlistSchema)