import {User} from "../../models/users.models.js"
import jwt from "jsonwebtoken"

const options = {
    httpOnly: true,
    secure: true
}

const generateAcessAndRefreshToken = async(userId) =>{
    const user = await User.findById(userId)
    const accessToken = user.accessToken()
    const refreshToken = user.refreshToken()

    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })

    return {accessToken, refreshToken}
}

export const signin = async(req, res) => {
    const {email, password} = req.body;
    if(!email || !password){
        return res.status(400).json({message: "All fields are required", status: false})
    }

    const user = await User.findOne({$or: [{ email}, {email: email}]})

    if(!user){
        return res.status(404).json({message: "User not found", status: false})
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        return res.status(401).json({message: "Invalid credentials", status: false})
    }

    const {accessToken, refreshToken} = await generateAcessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json({message: "User logged in successfully", status: true, token: accessToken, user: loggedInUser})
}

export const signup = async (req, res) => {
    const { email, password} = req.body
    
    if(!email || !password){
        return res.status(400).json({message: "All fields are required", status: false})
    }
    
    const existingUser = await User.findOne({email: email})
    if(existingUser){
        return res.status(409).json({message: "User already exists", status: false})
    }
    try {
        const username = email.split('@')[0] + Math.floor(Math.random() * 1000);
        const fullName = email.split('@')[0];
        const user = await User.create({ email, password, username, fullName });
        return res.status(201).json({message: "User created successfully", status: true, user})
    } catch (error) {
        return res.status(500).json({message: "Error creating user", error: error.message, status: false})
    }
}

export const logout = async (req, res) => {
    await User.findByIdAndUpdate(
        req.user?._id,
        {
            refreshToken: null
        },
        {
            new: true
        }
    )
    return res.status(200).clearCookie("refreshToken", "accessToken", options).json({message: "User logged out successfully", status: true})
}

export const refreshAccessToken = async (req, res) => {
    try {
        const incomingRefreshToken = req.cookies.refreshToken || req.header("Authorization")?.replace("Bearer ", "")
        if(!incomingRefreshToken){
            return res.status(401).json({message: "Unauthorized", status: false})
        }
        const decodedToken = await jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
        const user = await User.findById(decodedToken._id)
        if(!user){
            return res.status(401).json({message: "Unauthorized", status: false})
        }
        req.user = user
        const {accessToken, newRefreshToken} = await generateAcessAndRefreshToken(user._id)
        return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", newRefreshToken, options).json({message: "Access token refreshed successfully", status: true})
    } catch (error) {
        return res.status(401).json({message: "Invalid access token", status: false})
    }   
}

