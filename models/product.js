var mongoose= require('mongoose');
var Schema=mongoose.Schema;
var productSchema= new Schema({
image:{
    type:String,
    required:true
},
name:{
    type:String,
    required:true
},
qty:{
    type:Number,
    required:true
},
category:[{
    type:String,
    required:true
}],
price:Number,
reviews:[{
    type:Schema.Types.ObjectId,
    ref:"Review"
}]
},{timestamps:true})

productSchema.index({name:"text", category: 'text'});

module.exports= mongoose.model("Product",productSchema)