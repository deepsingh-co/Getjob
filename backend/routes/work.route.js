import express from "express";
import isAuth from "../middleware/isAuth.js";
import {
    uploadWorkImage,
    createWork,
    getMyWorks,
    getAllWorks,
    updateWork,
    deleteWork
} from "../controllers/work.controller.js";

const workRouter = express.Router();

workRouter.get("/", getAllWorks);
workRouter.get("/mine", isAuth, getMyWorks);
workRouter.post("/", isAuth, uploadWorkImage, createWork);
workRouter.put("/:id", isAuth, uploadWorkImage, updateWork);
workRouter.delete("/:id", isAuth, deleteWork);

export default workRouter;
