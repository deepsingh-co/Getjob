import express from "express";
import isAuth from "../middleware/isAuth.js";
import { createJob, getJobs, getJobMatches, getMatchedProfiles, getOpenJobs } from "../controllers/job.controller.js";

const jobRouter = express.Router();

jobRouter.post("/", isAuth, createJob);
jobRouter.get("/", isAuth, getJobs);
jobRouter.get("/open", isAuth, getOpenJobs);
jobRouter.get("/matches", isAuth, getMatchedProfiles);
jobRouter.get("/:id/matches", isAuth, getJobMatches);

export default jobRouter;
