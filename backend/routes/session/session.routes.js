import { Router } from "express";
import { createSession, deleteSession, sessionStatus } from "../../controllers/sessions/session.controller.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";

const SessionRouter = Router();

SessionRouter.route("/create").post(verifyJWT,createSession);
SessionRouter.route("/delete").delete(verifyJWT,deleteSession);
SessionRouter.route("/status").get(verifyJWT,sessionStatus);

export default SessionRouter;