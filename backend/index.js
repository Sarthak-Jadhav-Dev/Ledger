import 'dotenv/config';
import { createServer } from "http"
import { initSocket } from './socket/index.js'
import { dbConnect } from "./db/db.js";
import app from "./app.js";
import { startKeepAliveCron } from './cron/keepAlive.js';

const server = createServer(app);

const io = initSocket(server);

dbConnect().then(() => {
    console.log("MongoDB connected successfully");
    server.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running on port ${process.env.PORT || 8000}`);
        // Start the keep-alive cron job after server is listening
        startKeepAliveCron();
    });
}).catch((error) => {
    console.log("Error connecting to MongoDB:", error);
});

export {io}