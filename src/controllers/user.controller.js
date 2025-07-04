import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { deleteLocalFiles } from "../utils/deleteLocalFiles.js";

const generateRefreshAndAccessToken=async(userId)=>{
    try {
        const user=await User.findById(userId)
        if (!user) {
            throw new ApiError(404, "User not found in token generation");
        }
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()
        // add refresh token to data base aswell do no need to relogin again
        user.refreshToken=refreshToken
        //SAVING can give error as password is not passed here
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}
    } catch (error) {
        console.error("Token generation error:", error);
        throw new ApiError(500,"Something went wrong")
    }
}

const registerUser=asyncHandler(async(req,res)=>{
    //getting data
    const {username,email,fullName,password}=req.body;
    //checking for valid data
    if([username,email,fullName,password].some((field)=>field?.trim==="")){
        throw new ApiError(400,"All fields are required")
    }
    // getting avatar from files
    const avatarLocalPath=req.files?.avatar[0]?.path;
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar is required")
    }

    const existedUser=await User.findOne({
        $or:[{username},{email}]
    })
    if(existedUser){
        deleteLocalFiles([avatarLocalPath]) // neccessaey as if existed user re enters the images are saved locally though not uploded on cloud
        throw new ApiError(400,"User already exists")
    }

    const avatar=await uploadOnCloudinary(avatarLocalPath);
    if(!avatar){
        throw new ApiError(400,"failed to upload on cloudinary")
    }

    const user=await User.create({
        fullName,
        avatar:avatar.url,
        email,
        password,
        username:username.toLowerCase()

    })

    const createdUser=await User.findById(user._id).select("-password -refreshToken")
    if(!createdUser){
        throw new ApiError(500,"user not registered!! Server problem")
    }

    return res
    .status(201)
    .json(
        new ApiResponse(201,createdUser,"User registered successfully!!!")
    )


})

const loginUser=asyncHandler(async(req,res)=>{
    const {email,username,password}=req.body;

    if(!email && !username){
        throw new ApiError(400,"Username or email is required")
    }

    const user=await User.findOne({
        $or:[{username},{email}]
    })
    if(!user){
        throw new ApiError(401,"User with this email or username doesn't exits")
    }

    const isPasswordVaild=await user.isPasswordCorrect(password)
    if(!isPasswordVaild){
        throw new ApiError(400,"Incorrect Password")
    }

    const {accessToken,refreshToken}=await generateRefreshAndAccessToken(user._id)

    const loggedUser=await User.findById(user._id).select("-password -refreshToken")

    const options={
        httpOnly:true,
        secure:true
    }

    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user:loggedUser,
                accessToken,
                refreshToken
            },
            "User logged in Successfully!!"
            
        )
    )
})

const logoutUser=asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(req.user._id,
        {
            $unset:{
                refreshToken:1
            }
        },
        {
            new:true
        }
    )
    const options={
        httpOnly:true,
        secure:true
    }
    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(
        200,
        {},
        "User logged out successfully!!!"
    ))
})

export {registerUser,loginUser,logoutUser}