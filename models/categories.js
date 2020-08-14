var mongoose= require('mongoose');
var Schema= mongoose.Schema;
var categorySchema= new Schema({
    category:String

},{timestamps:true})

module.exports= mongoose.model('Category',categorySchema)