import Interview from "../models/interview.model.js";
import Job from "../models/job.model.js";
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

export const getMyInterviews = async (req, res) => {
    try {
        const interviews = await Interview.find({ candidate: req.userId })
            .populate("job", "title company location interviewDateTime status refCode")
            .populate("profile", "phone skills experienceYears")
            .sort({ updatedAt: -1 });

        return res.status(200).json(interviews);
    } catch (error) {
        return res.status(500).json({ message: `Failed to get interviews ${error.message}` });
    }
};

export const getCompanyCandidates = async (req, res) => {
    try {
        const jobs = await Job.find({ postedBy: req.userId }).select("_id");
        const jobIds = jobs.map((job) => job._id);

        const interviews = await Interview.find({ job: { $in: jobIds } })
            .populate("candidate", "name email")
            .populate("profile", "phone skills experienceYears location headline")
            .populate("job", "title company location refCode interviewDateTime")
            .sort({ matchScore: -1 });

        return res.status(200).json(interviews);
    } catch (error) {
        return res.status(500).json({ message: `Failed to get candidates ${error.message}` });
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
            status: { $in: ["matched", "hr_notified", "human_review", "follow_up"] }
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

export const handleHrGather = async (req, res) => {
    try {
        if (!validateTwilioSignature(req)) {
            return res.status(403).type("text/xml").send("<Response></Response>");
        }

        const say = (text) =>
            res.status(200).type("text/xml").send(
                `<?xml version="1.0" encoding="UTF-8"?><Response><Say voice="Polly.Joanna" language="en-IN">${text}</Say></Response>`
            );

        const job = await Job.findById(req.query.job);
        if (!job) {
            return say("No active job found for this call. Goodbye.");
        }

        const pending = await Interview.find({
            job: job._id,
            status: { $in: ["matched", "hr_notified", "hr_confirmed", "human_review", "follow_up"] }
        })
            .populate("job")
            .populate("candidate", "name email")
            .populate("profile", "phone skills");

        if (!pending.length) {
            return say("There are no pending candidates for this role. Goodbye.");
        }

        const digit = String(req.body.Digits || "");
        const now = new Date();

        if (digit === "1") {
            const results = await confirmInterviews(pending);
            const placed = results.filter((result) => result.called).length;
            return say(`Confirmed. ${pending.length} candidate interviews confirmed and ${placed} confirmation calls placed. Goodbye.`);
        }

        if (digit === "2") {
            for (const interview of pending) {
                interview.status = "human_review";
                interview.hrRespondedAt = now;
                interview.logs.push({ event: "human_review", detail: "HR pressed 2 - flagged for human review" });
            }
            await Promise.all(pending.map((interview) => interview.save()));
            return say(`${pending.length} candidate profiles flagged for human review. Open the company dashboard to review them. Goodbye.`);
        }

        if (digit === "3") {
            for (const interview of pending) {
                interview.status = "rejected";
                interview.hrRespondedAt = now;
                interview.logs.push({ event: "hr_cancelled", detail: "HR pressed 3 - shortlist cancelled" });
            }
            await Promise.all(pending.map((interview) => interview.save()));
            return say(`Cancelled. ${pending.length} candidates marked as not selected. Goodbye.`);
        }

        if (digit === "4") {
            for (const interview of pending) {
                interview.status = "follow_up";
                interview.hrRespondedAt = now;
                interview.logs.push({ event: "hr_follow_up", detail: "HR pressed 4 - follow up scheduled" });
            }
            await Promise.all(pending.map((interview) => interview.save()));
            return say(`Follow up scheduled for ${pending.length} candidates. They stay on your dashboard until you decide. Goodbye.`);
        }

        return say("Invalid option. Goodbye.");
    } catch (error) {
        console.error("HR gather handling failed", error.message);
        return res.status(500).type("text/xml").send("<Response></Response>");
    }
};

export const handleCandidateGather = async (req, res) => {
    try {
        if (!validateTwilioSignature(req)) {
            return res.status(403).type("text/xml").send("<Response></Response>");
        }

        const interview = await Interview.findOne({ callSid: req.body.CallSid });
        const digit = String(req.body.Digits || "");
        const now = new Date();

        let message = "Invalid option. Goodbye.";

        if (interview) {
            if (digit === "1") {
                interview.logs.push({ event: "candidate_accepted", detail: "Candidate pressed 1 - interview confirmed" });
                message = "Thank you. Your interview is confirmed. The recruiter will share the details.";
            } else if (digit === "2") {
                interview.status = "rejected";
                interview.hrRespondedAt = now;
                interview.logs.push({ event: "candidate_not_confirmed", detail: "Candidate pressed 2 - cannot confirm" });
                message = "Noted. You have not confirmed this interview. The recruiter will be informed.";
            } else if (digit === "3") {
                interview.status = "delayed";
                interview.hrRespondedAt = now;
                interview.logs.push({ event: "candidate_delay", detail: "Candidate pressed 3 - requested a delay" });
                message = "Noted. The interview is marked as delayed. The recruiter will reach out with a new slot.";
            } else if (digit === "4") {
                interview.status = "next_job";
                interview.hrRespondedAt = now;
                interview.logs.push({ event: "candidate_next_job", detail: "Candidate pressed 4 - asked for the next job" });
                message = "Noted. You will be considered for the next matching job. Thank you.";
            }

            await interview.save();
        }

        return res.status(200).type("text/xml").send(
            `<?xml version="1.0" encoding="UTF-8"?><Response><Say voice="Polly.Joanna" language="en-IN">${message}</Say></Response>`
        );
    } catch (error) {
        console.error("Candidate gather handling failed", error.message);
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
