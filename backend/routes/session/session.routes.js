import { Router } from "express";
import { createSession, deleteSession, getActiveSessions } from "../../controllers/sessions/session.controller.js";
import { verifyJWT } from "../../middleware/auth.middleware.js";

const SessionRouter = Router();

SessionRouter.route("/create").post(verifyJWT,createSession);
SessionRouter.route("/delete").delete(verifyJWT,deleteSession);
SessionRouter.route("/active").get(verifyJWT,getActiveSessions);

export default SessionRouter;