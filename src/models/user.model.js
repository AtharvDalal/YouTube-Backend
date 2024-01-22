import mongoose, {Schema} from 'mongoose'
import jwt from 'jsonwebtoken'
import bcrypt from "bcrypt"

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    
  },
  fullname: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true,
    
  },
  avtar: {
    type: String,
    required: true,
  },
  coverImage:{
     type: String
  },
  watchHistory: [
    {
        type: Schema.Types.ObjectId,
        ref: "Video"
    }
  ],
  passowrd:{
    type: String,
    required: [true, "Password Is required"]
  },
  refreshToken: {
    type: String,
    required: [true, "Password Is required"] // for delete
  }
}, {timestamps: true})



userSchema.pre("save", async function (next){
  if(!this.isModified("password")) return next();

  this.passowrd = await bcrypt.hash(this.passowrd, 10)
  next();
})

userSchema.methods.isPasswordCorrect = async function (passowrd){
return await bcrypt.compare(passowrd, this.passowrd , true)
}


userSchema.methods.generateAccessToken = function(){
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullname: this.fullname
    },
    process.env.ACCES_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCES_TOKEN_EXPIRY
    }
  )
}

userSchema.methods.generateRefreshToken = function(){
  return jwt.sign(
    {
      _id: this._id,
      
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
  )
}


export const User = mongoose.model("User", userSchema)