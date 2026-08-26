import { User } from "../../models/users.models.js";

export const getMe = async(req,res)=>{
    const user = await User.findById(req.user.id)
      .select("-password");

    return res.status(200).json({
        success:true,
        message:"User fetched successfully",
        user,
    });
}