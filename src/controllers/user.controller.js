import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


// Function for genrate Access and Refresh Token
const genrateAccessAndRefreshTokens = async(userId) =>
{
    try
    {
        const user = await User.findById(userId)
        const accessToken= user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }
    }
    catch
    {
        throw new ApiError(500, "Something went wrong while Genrating Refresh and Access Token")
    }
}


// Register User
const registerUser = asyncHandler (
   async (req,res) => {
       const {fullName, email, username, password} = req.body
       //console.log("email", email);
       if(
        [fullName, email, username, password].some((field) => field.trim() === "")
       )
       {
            throw new ApiError(400, "Al fields are required")
       }

     const existeduser =   await  User.findOne({
        $or: [{ username } , { email }]
       })

       if(existeduser){
        throw new ApiError(409, "user with email or username already exist")
       }

       //console.log(req.files);

       const avatarLocalPath = req.files?.avatar[0]?.path;
       //const coverImageLocalPath = req.files?.coverImage[0]?.path;

       let coverImageLocalPath;
       if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
           coverImageLocalPath = req.files.coverImage[0].path
       }

       if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }
   

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email, 
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

    }
)


// Login User
const loginUser = asyncHandler(async(req,res) => 
    {
        const {email, username, password} = req.body
        if(!email || !username)
            {
                throw new ApiError(400, "username or email is required")
            } 
       const user = await User.findOne({
            $or:[{username}, {email}]
        })
        if(!user)
        {
            throw new ApiError(404, "User does not exist")
        }
        const isPasswordValid =await user.isPasswordCorrect(password)
        if(!password)
            {
                throw new ApiError(404, "Invalid user credentials")
            }
           const { accessToken,refreshToken } = await genrateAccessAndRefreshTokens(user._id)
           const loggedInUser = await User.findById(user._id).select(
            -password -refreshToken
           )
           const options = {
            httpOnly: true,
            secure: true
           }
           return res
           .status(200)
           .cookie("accesstokenn", accessToken, options)
           .cookie("refreshToken", refreshToken, options)
           .json
           (
            new ApiResponse(
                200,
                {
                    user:loggedInUser, accessToken, refreshToken
                },
                "User Logged in Successfully"
            )
           )
    } 
)


// Logout User
const logOutUser = asyncHandler(async(req,res) =>  
    {

    })

export { registerUser, loginUser, logOutUser }