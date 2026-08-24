import { createServer} from "http"
import dotenv from "dotenv";
import { initSocket } from './socket/index.js'
import { dbConnect } from "./db/db.js";
import app from "./app.js";

dotenv.config();

const server = createServer(app);

const io = initSocket(server);

dbConnect().then(() => {
    console.log("MongoDB connected successfully");
    server.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running on port ${process.env.PORT || 8000}`);
    });
}).catch((error) => {
    console.log("Error connecting to MongoDB:", error);
});

export {io}