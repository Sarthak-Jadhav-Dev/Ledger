import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
const app = express();

app.use(cors({
    origin: true,
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

//authentication related routes
import authRouter from "./routes/auth/authRoutes.router.js"
app.use("/api/v1/auth", authRouter);

//me route
import Merouter from "./routes/me/me.routes.js"
app.use("/api/auth", Merouter);

//session related routes
import SessionRouter from "./routes/session/session.routes.js"
app.use("/api/v1/session", SessionRouter);

//file routes
import FileRouter from "./routes/files/file.router.js"
app.use("/api/v1/upload", FileRouter);

export default app;