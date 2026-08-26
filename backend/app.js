import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
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

export default app;