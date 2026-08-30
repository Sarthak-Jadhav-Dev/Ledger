import { Router } from "express";
import { getMe } from "../../controllers/me/me.controllers.js";
import {verifyJWT} from "../../middleware/auth.middleware.js";

const Merouter = Router();

Merouter.route("/me").get(verifyJWT, getMe);

export default Merouter;