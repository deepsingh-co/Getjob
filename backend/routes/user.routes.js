import express from "express";
import isAuth from "../middleware/isAuth.js";
import { getCurrentUser, getProfile, upsertProfile } from "../controllers/user.controller.js";


const userRouter = express.Router();

userRouter.get("/current-user" , isAuth , getCurrentUser)
userRouter.get("/profile", isAuth, getProfile)
userRouter.post("/profile", isAuth, upsertProfile)


export default userRouter;
