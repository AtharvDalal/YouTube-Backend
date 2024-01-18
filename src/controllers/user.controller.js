import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {User} from '../models/user.model.js'

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
  if (existUser) {
    throw new ApiError(409, "User Alredy Exists")
  }
  
} )


export {registerUser}