import express from "express";
import { getPublicStats } from "../controllers/stats.controller.js";

const statsRouter = express.Router();

statsRouter.get("/", getPublicStats);

export default statsRouter;
