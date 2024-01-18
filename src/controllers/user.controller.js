import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {User} from '../models/user.model.js'
import {UploadCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from '../utils/ApiResponse.js'

const registerUser = asyncHandler( async (req,res)=>{
    //get user details from frontend
    //validation - not empty
    // check if user already exist: email,username
    //check for images
    // upload them to cloudninry


    const {fullname,username,email,passowrd} = req.body
  console.log("email:", email);

  if ([fullname,email,username,passowrd].some((feild)=> feild?.trim() === '' )) {
    throw new ApiError(400, "All Feilds are Required")
  }

  const existUser = User.findOne({
    $or: [{email}, {username}]
  })

  console.log(existUser);
  if (existUser) {
    throw new ApiError(409, "User Alredy Exists")
  }
  
 const avatarLocalPath = req.files?.avatar[0]?.path;
 const coverImageLocalPath = req.files?.coverImage[0]?.path;


 if (!avatarLocalPath) {
  throw new ApiError(400, "Avatar File Is Required")
 }

 const avatar = await UploadCloudinary(avatarLocalPath)
 const coverImage = await  UploadCloudinary(coverImageLocalPath)

 if (!avatar) {
  throw new ApiError(400, "Avatar File Is Required")
 }


 const user = await User.create({
  fullname,
  avatar: avatar.url,
  coverImage: coverImage?.url || "",
  email,
  passowrd,
  username: username.toLowerCase()


 })

 const createdUser = await User.findById(user._id).select(
  "-password -refreshToken"
 )

 if (!createdUser) {
    throw new ApiError(500, "Something went wrong while Registering User")
 }
 return res.status(201).json(
  new ApiResponse(200, createdUser, "User Registered Successfully")
 )

  
} )


export {registerUser}