import {User} from "../models/users.models.js"

export const verifyJWT = async (req, res, next) => {
    try {
        const token = req.cookies.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        if(!token){
            return res.status(401).json({message: "Unauthorized", status: false})
        }
        const decodedToken = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedToken._id)
        if(!user){
            return res.status(401).json({message: "Unauthorized", status: false})
        }
        req.user = user
        next()
    } catch (error) {
        return res.status(401).json({message: "Unauthorized", status: false})
    }
}