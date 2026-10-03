import express from "express";
import isAuth from "../middleware/isAuth.js";
import { createJob, getJobs, getJobMatches, getMatchedProfiles } from "../controllers/job.controller.js";

const jobRouter = express.Router();

jobRouter.post("/", isAuth, createJob);
jobRouter.get("/", isAuth, getJobs);
jobRouter.get("/matches", isAuth, getMatchedProfiles);
jobRouter.get("/:id/matches", isAuth, getJobMatches);

export default jobRouter;
