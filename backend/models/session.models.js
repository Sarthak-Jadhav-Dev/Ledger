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
    status: {
        type: String,
        enum: ["active", "paired", "ended"],
        default: "active"
    }
}, { timestamps: true })

export const Session = mongoose.model("Session", sessionSchema);