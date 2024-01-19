import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { UploadCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Jwt from "jsonwebtoken";

const generateAccessAndRefershToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accesToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accesToken, refreshToken };
  } catch (error) {}
};

const registerUser = asyncHandler(async (req, res) => {
  //get user details from frontend
  //validation - not empty
  // check if user already exist: email,username
  //check for images
  // upload them to cloudninry

  const { fullname, username, email, passowrd } = req.body;
  console.log("email:", email);

  if (
    [fullname, email, username, passowrd].some((feild) => feild?.trim() === "")
  ) {
    throw new ApiError(400, "All Feilds are Required");
  }

  const existUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  console.log(existUser);
  if (existUser) {
    throw new ApiError(409, "User Alredy Exists");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar File Is Required");
  }

  const avatar = await UploadCloudinary(avatarLocalPath);
  const coverImage = await UploadCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar File Is Required");
  }

  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    passowrd,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while Registering User");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User Registered Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, passowrd } = req.body;

  if (!username || !email) {
    throw new ApiError(400, "Username or Password is Requried");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (!user) {
    throw new ApiError(404, "User dose Not exist");
  }

  const isPassowrdValid = await user.isPasswordCorrect(passowrd);

  if (!isPassowrdValid) {
    throw new ApiError(401, "Passowrd Incorrect");
  }

  const { accesToken, refreshToken } = await generateAccessAndRefershToken(
    user._id
  );

  const loggedInuser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accesToken", accesToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInuser,
          accesToken,
          refreshToken,
        },
        "User Logged In SucessFully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("refreshToken", options)
    .clearCookie("accesToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incommimgRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (incommimgRefreshToken) {
    throw new ApiError(401, "unauthorized Request");
  }

 try {
   const decodedToken = Jwt.verify(
     incommimgRefreshToken,
     process.env.REFRESH_TOKEN_SECRET
   );
 
   const user = await User.findById(decodedToken?._id);
 
   if (!user) {
     throw new ApiError(401, "Invalid Refresh Token");
   }
 
   if (incommimgRefreshToken !== user?.refreshToken) {
     throw new ApiError(401, " Refresh Token Is expired Or Used");
   }
 
   const options = {
     httpOnly: true,
     secure: true,
   };
 
   const { accesToken, newRefreshToken } = await generateAccessAndRefershToken(
     user._id
   );
 
   return res
     .status(200)
     .cookie("accesToken", accesToken, options)
     .cookie("newRefreshToken", newRefreshToken, options)
     .json(
       new ApiResponse(200, {accesToken, newRefreshToken},
         "Access Token Refreshed"
         )
     )
 } catch (error) {
     throw new ApiError(401, error?.message || "Invalid Refresh Token")
 }
});

export { registerUser, loginUser, logoutUser,refreshAccessToken };
