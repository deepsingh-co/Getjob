import express from "express";
import isAuth from "../middleware/isAuth.js";
import {
    confirmInterview,
    manualConfirmInterview,
    rejectInterview,
    getMyInterviews,
    getCompanyCandidates,
    getInterviewRoom,
    updateMeetingStatus,
    handleHrSmsReply,
    handleHrGather,
    handleCandidateGather,
    handleCallStatus
} from "../controllers/hiring.controller.js";

const hiringRouter = express.Router();

hiringRouter.get("/my-interviews", isAuth, getMyInterviews);
hiringRouter.get("/candidates", isAuth, getCompanyCandidates);
hiringRouter.post("/interviews/:id/confirm", isAuth, confirmInterview);
hiringRouter.post("/interviews/:id/manual-confirm", isAuth, manualConfirmInterview);
hiringRouter.post("/interviews/:id/reject", isAuth, rejectInterview);
hiringRouter.get("/interviews/:id", isAuth, getInterviewRoom);
hiringRouter.post("/interviews/:id/meeting", isAuth, updateMeetingStatus);

hiringRouter.post("/twilio/inbound-sms", express.urlencoded({ extended: false }), handleHrSmsReply);
hiringRouter.post("/twilio/hr-gather", express.urlencoded({ extended: false }), handleHrGather);
hiringRouter.post("/twilio/candidate-gather", express.urlencoded({ extended: false }), handleCandidateGather);
hiringRouter.post("/twilio/call-status", express.urlencoded({ extended: false }), handleCallStatus);

export default hiringRouter;
