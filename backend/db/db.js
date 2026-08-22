import mongoose from "mongoose";

export const dbConnect = async ()=>{
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.log("Error connecting to MongoDB:", error);
    }
}
