import dotenv from "dotenv";
import { dbConnect } from "./db/db.js";
import app from "./app.js";

dotenv.config();

dbConnect().then(() => {
    console.log("MongoDB connected successfully");
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running on port ${process.env.PORT || 8000}`);
    });
}).catch((error) => {
    console.log("Error connecting to MongoDB:", error);
});