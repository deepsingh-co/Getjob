import express from "express";
import isAuth from "../middleware/isAuth.js";
import { getCurrentUser, getProfile, upsertProfile, upsertCompanyProfile } from "../controllers/user.controller.js";


const userRouter = express.Router();

userRouter.get("/current-user" , isAuth , getCurrentUser)
userRouter.get("/profile", isAuth, getProfile)
userRouter.post("/profile", isAuth, upsertProfile)
userRouter.post("/company-profile", isAuth, upsertCompanyProfile)


export default userRouter;
