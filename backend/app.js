import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

//authentication related routes
import authRouter from "../backend/routes/auth/authRoutes.router.js"
app.use("/api/v1/auth", authRouter);

//session related routes
import SessionRouter from "../backend/routes/session/session.routes.js"
app.use("/api/v1/session", SessionRouter);

export default app;