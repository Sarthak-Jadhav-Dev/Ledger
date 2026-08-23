import crypto from "crypto";
import { Session } from "../../models/session.models.js";

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
}

export const deleteSession = async(req,res)=>{
    
}

export const sessionStatus = async(req,res)=>{

}