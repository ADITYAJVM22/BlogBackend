import mongoose,{Schema} from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const userSchema=new Schema(
    {
        username:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
            index:true
        },
        email:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
            
        },
        fullName:{
            type:String,
            required:true,
            trim:true,
            index:true
        },
        avatar:{
            type:String,
            required:true
        },
        blogs:[
            {
                type:Schema.Types.ObjectId,
                ref:"Blog"
            }
        ],
        password:{
            type: String,
            required:[true,'Password is required']
        },
        refreshToken:{
            type: String
        }
        
    },{timestamps:true}
)
userSchema.pre("save",async function(next) {
    if(!this.isModified("password")) return next;

    this.password=await bcrypt.hash(this.password,10);
    next()
})
userSchema.methods.isPasswordCorrect=async function(pass) {
    return await bcrypt.compare(pass,this.password)
}

//generating access and refresh token
userSchema.methods.generateAccessToken=async function() {
    return jwt.sign({
        _id:this._id,
        email:this.email,
        username:this.username,
        fullName:this.fullName
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRE
    }
)
}
userSchema.methods.generateRefreshToken=async function() {
    return jwt.sign({
        _id:this._id,
        
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRE
    }
)
}

export const User=mongoose.model("User",userSchema)