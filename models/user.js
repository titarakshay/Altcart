var mongoose=require("mongoose");
var Schema=mongoose.Schema;
var bcrypt=require('bcryptjs')
var userSchema= new Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    name:String,
    password:{
        type:String,
        required:true
    },
    favoriteItems:[{
        type:Schema.Types.ObjectId,
        ref:"Product"
    }],
   cart:{
       type:Schema.Types.ObjectId,
       ref:"Cart"
   },
   block:{
       type:Boolean,
       default:false
   },
   isVerified: {
       type:Boolean,
       default:false
   },
   code: {
       type: Number,
   },
   isAdmin:{
       type:Boolean,
       default:false
   }

},{timestamps:true})

userSchema.pre('save', async function(next){
    try {
        if(this.password && this.isModified("password")){
            this .password= await bcrypt.hash(this.password,10);
            return next();
        }else{
            return next();
        }
    } catch (error) {
        next(error);
    }
})
userSchema.methods.changepassword= async function(password){
    try {
        console.log(password,"we are her in password")
        return await bcrypt.hash(password,10);
       
    } catch (error) {
       next(error) 
    }
}
userSchema.methods.verify=  function(password){
    return bcrypt.compareSync(password,this.password)
}

module.exports=mongoose.model("User", userSchema)