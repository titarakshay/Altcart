var mongoose= require("mongoose");
var Schema= mongoose.Schema;
var adminSchema= new Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    name:String,
    image:String,
    githubId:String,
    googleId:String,
    isVerified:{
        type:Boolean,
        default:true
    },
    isAdmin:{
        type:Boolean,
        default:true
    }
},{timestamps:true})

module.exports=mongoose.model("Admin", adminSchema)