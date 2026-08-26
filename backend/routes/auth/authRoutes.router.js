import { Router } from "express";
import { signin, signup, logout, refreshAccessToken } from "../../controllers/authentication/authentication.controller.js"
import { verifyJWT } from "../../middleware/auth.middleware.js"

const authRouter = Router()

authRouter.route("/signin").post(signin);
authRouter.route("/signup").post(signup);
authRouter.route("/logout").post(verifyJWT, logout);
authRouter.route("/refresh-token").post(verifyJWT, refreshAccessToken)

export default authRouter;
