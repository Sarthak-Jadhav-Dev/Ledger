import crypto from "crypto";
import { Session } from "../../models/session.models.js";
import redisClient from "../../db/redis.js";

const generateSessionId = () => {
  return crypto.randomBytes(4).toString('hex').toUpperCase()
  //"A3F8B2C1"
}
const generateEncryptionKEy = () =>{
    return crypto.randomBytes(32).toString("hex");
}

export const createSession = async(req,res) => {    
    const user = req.user;

    let {timeLimit} = req.body;
    
    if(!timeLimit){
        timeLimit = Number(5);
    }

    const sessionId = generateSessionId();
    const encryptionKey = generateEncryptionKEy();

    const session = await Session.create({
        session_id : sessionId,
        encryption_key : encryptionKey,
        owner : user._id,
        time_limit:timeLimit,
    })

    if(!session){
        return res.status(500).json({
            success:false,
            message:"Something went wrong while creating session"
        })
    }

    //add in redis 
    await redisClient.set(sessionId, "session", { ex: timeLimit * 60 })

    return res.status(201).json({
        success:true,
        message:"Session created successfully",
        data:session
    })
}

export const deleteSession = async(req,res)=>{
    const {session_Id} = req.body;

    if(!session_Id){
        return res.status(400).json({
            success:false,
            message:"Session Id is required"
        })
    }

    const session = await Session.findOneAndDelete({
        session_id : session_Id
    })

    if(!session){
        return res.status(404).json({
            success:false,
            message:"Session not found"
        })
    }

    await redisClient.del(session_Id)

    return res.status(200).json({
        success:true,
        message:"Session deleted successfully"
    })
}

// export const sessionStatus = async(req,res)=>{

// }