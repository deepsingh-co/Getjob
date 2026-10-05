import express from "express";
import isAuth from "../middleware/isAuth.js";
import {
    confirmInterview,
    rejectInterview,
    getMyInterviews,
    handleHrSmsReply,
    handleCandidateGather,
    handleCallStatus
} from "../controllers/hiring.controller.js";

const hiringRouter = express.Router();

hiringRouter.get("/my-interviews", isAuth, getMyInterviews);
hiringRouter.post("/interviews/:id/confirm", isAuth, confirmInterview);
hiringRouter.post("/interviews/:id/reject", isAuth, rejectInterview);

hiringRouter.post("/twilio/inbound-sms", express.urlencoded({ extended: false }), handleHrSmsReply);
hiringRouter.post("/twilio/candidate-gather", express.urlencoded({ extended: false }), handleCandidateGather);
hiringRouter.post("/twilio/call-status", express.urlencoded({ extended: false }), handleCallStatus);

export default hiringRouter;
