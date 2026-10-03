import Interview from "../models/interview.model.js";
import { confirmInterviews } from "../services/hiring.service.js";
import { validateTwilioSignature } from "../services/twilio.service.js";

const loadInterview = (id) =>
    Interview.findById(id)
        .populate("job")
        .populate("candidate", "name email")
        .populate("profile", "phone skills");

export const confirmInterview = async (req, res) => {
    try {
        const interview = await loadInterview(req.params.id);
        if (!interview) {
            return res.status(404).json({ message: "Interview not found" });
        }
        if (interview.status === "candidate_called") {
            return res.status(200).json({ message: "Candidate already called", interview });
        }

        const results = await confirmInterviews([interview]);
        return res.status(200).json({ message: "Interview confirmed, candidate call placed", interview, results });
    } catch (error) {
        return res.status(500).json({ message: `Failed to confirm interview ${error.message}` });
    }
};

export const rejectInterview = async (req, res) => {
    try {
        const interview = await loadInterview(req.params.id);
        if (!interview) {
            return res.status(404).json({ message: "Interview not found" });
        }

        interview.status = "rejected";
        interview.hrRespondedAt = new Date();
        interview.logs.push({ event: "hr_rejected", detail: "HR rejected the candidate" });
        await interview.save();

        return res.status(200).json({ message: "Interview rejected", interview });
    } catch (error) {
        return res.status(500).json({ message: `Failed to reject interview ${error.message}` });
    }
};

const findJobFromSms = async (body, from) => {
    const Job = (await import("../models/job.model.js")).default;
    const refMatch = body.toUpperCase().match(/JOB-?([A-F0-9]{6})\b/);

    if (refMatch) {
        const job = await Job.findOne({ refCode: refMatch[1] });
        if (job) return job;
    }
    return Job.findOne({ hrPhone: from, status: "active" }).sort({ createdAt: -1 });
};

export const handleHrSmsReply = async (req, res) => {
    try {
        if (!validateTwilioSignature(req)) {
            return res.status(403).type("text/xml").send("<Response></Response>");
        }

        const body = String(req.body.Body || "").trim();
        const from = req.body.From || "";
        const isConfirm = /^yes/i.test(body);
        const isReject = /^no/i.test(body);

        if (!isConfirm && !isReject) {
            return res.status(200).type("text/xml").send(
                "<Response><Message>Invalid reply. Reply YES &lt;job code&gt; to confirm interviews or NO &lt;job code&gt; to reject.</Message></Response>"
            );
        }

        const job = await findJobFromSms(body, from);
        if (!job) {
            return res.status(200).type("text/xml").send(
                "<Response><Message>No active job found for this number.</Message></Response>"
            );
        }

        const interviews = await Interview.find({
            job: job._id,
            status: { $in: ["matched", "hr_notified"] }
        }).populate("job").populate("candidate", "name email").populate("profile", "phone skills");

        if (!interviews.length) {
            return res.status(200).type("text/xml").send(
                "<Response><Message>No pending candidates for this job.</Message></Response>"
            );
        }

        let reply = "";

        if (isConfirm) {
            const results = await confirmInterviews(interviews);
            const placed = results.filter((result) => result.called).length;
            reply = `Confirmed. ${placed} automated interview confirmation call(s) placed for "${job.title}".`;
        } else {
            interviews.forEach((interview) => {
                interview.status = "rejected";
                interview.hrRespondedAt = new Date();
                interview.logs.push({ event: "hr_rejected", detail: "HR replied NO over SMS" });
            });
            await Promise.all(interviews.map((interview) => interview.save()));
            reply = `Rejected. We marked ${interviews.length} candidate(s) for "${job.title}" as not selected.`;
        }

        return res.status(200).type("text/xml").send(`<Response><Message>${reply}</Message></Response>`);
    } catch (error) {
        console.error("Inbound SMS handling failed", error.message);
        return res.status(500).type("text/xml").send("<Response></Response>");
    }
};

export const handleCandidateGather = async (req, res) => {
    try {
        if (!validateTwilioSignature(req)) {
            return res.status(403).type("text/xml").send("<Response></Response>");
        }

        const interview = await Interview.findOne({ callSid: req.body.CallSid });
        const digit = req.body.Digits;

        if (interview) {
            interview.logs.push({
                event: digit === "1" ? "candidate_accepted" : "candidate_reschedule",
                detail: `DTMF input ${digit || "none"}`
            });
            await interview.save();
        }

        const message = digit === "1"
            ? "Thank you. Your interview is confirmed. The recruiter will share the details."
            : "Thanks for the response. The recruiter will reach out to reschedule your interview.";

        return res.status(200).type("text/xml").send(`<Response><Say voice="Polly.Joanna" language="en-IN">${message}</Say></Response>`);
    } catch (error) {
        return res.status(500).type("text/xml").send("<Response></Response>");
    }
};

export const handleCallStatus = async (req, res) => {
    try {
        const interview = await Interview.findOne({ callSid: req.body.CallSid });
        if (interview) {
            interview.callStatus = req.body.CallStatus;
            interview.logs.push({ event: "call_status", detail: req.body.CallStatus });
            await interview.save();
        }
        return res.status(200).send("ok");
    } catch (error) {
        return res.status(500).send("error");
    }
};
