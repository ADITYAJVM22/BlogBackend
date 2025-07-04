import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
export const verifyJWT=asyncHandler(async (req,res,next)=>{
    try {
        const token=req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
        // console.log(token);
        if(!token || typeof token !=="string"){
            throw new ApiError(400,"Unauthorized access")
        }
        const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        const user=await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user){
            throw new ApiError(401,"Invalid access Token")
        }
        //here we have extraces the token from cookies and verified it in decoded and we know in user model while accestoken was generated we have send a lot of info of user too like id,emial,username,fullname and from thta we used the id to find user
        // after this middleware we can access user without getting details again for like logout,passChange 
        req.user=user;
        next();
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid AccessToken")
    }
})