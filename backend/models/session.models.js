import mongoose from "mongoose"

const sessionSchema = new mongoose.Schema({
    //session id is the name itself
    session_id: {
        type: String,
        required: true,
    },
    encryption_key: {
        type: String,
        required: true,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    timeLimit:{
        type:Number,
        default:5,
    },
    data: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, { timestamps: true })

export const Session = mongoose.model("Session", sessionSchema);