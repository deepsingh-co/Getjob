import crypto from "crypto";
import Profile from "../models/profile.model.js";
import Interview from "../models/interview.model.js";
import { findMatches } from "./matching.service.js";
import { sendSms, callCandidate, callHr } from "./twilio.service.js";

export const generateRefCode = () => crypto.randomBytes(3).toString("hex").toUpperCase();

export const matchCandidatesForJob = async (job) => {
    const profiles = await Profile.find({ openToWork: true }).populate("user");
    const matches = findMatches(job, profiles.filter((profile) => profile.user));
    const interviews = [];

    for (const match of matches) {
        try {
            const interview = await Interview.findOneAndUpdate(
                { job: job._id, candidate: match.profile.user._id },
                {
                    $setOnInsert: {
                        job: job._id,
                        candidate: match.profile.user._id,
                        profile: match.profile._id,
                        matchScore: match.score,
                        matchedSkills: match.matchedSkills,
                        missingSkills: match.missingSkills,
                        status: "matched",
                        logs: [{ event: "matched", detail: `Match score ${match.score}%` }]
                    }
                },
                { returnDocument: "after", upsert: true }
            );
            interviews.push(interview);
        } catch (error) {
            console.error("Failed to save interview match", error.message);
        }
    }

    await Interview.populate(interviews, { path: "candidate", select: "name email" });
    await Interview.populate(interviews, { path: "profile", select: "phone skills experienceYears" });

    return interviews;
};

const candidateLine = (interview, index) => {
    const name = interview.candidate?.name || "Candidate";
    const skills = interview.matchedSkills?.slice(0, 4).join(", ") || "n/a";
    return `${index + 1}. ${name} - ${interview.matchScore}% match (${skills})`;
};

export const notifyHr = async (job, interviews) => {
    if (!interviews.length) {
        return { notified: false, reason: "No matching candidates found" };
    }

    const lines = interviews.slice(0, 5).map(candidateLine).join("\n");
    const body =
        `GetJob: ${interviews.length} suitable candidate(s) found for "${job.title}" at ${job.company}.\n` +
        `${lines}\n` +
        `You are receiving an automated call with the same shortlist. Press 1 to confirm, 2 for human review, 3 to cancel, 4 for follow up.\n` +
        `Or reply YES ${job.refCode} to confirm the interview and we will call the candidates to schedule it.\n` +
        `Reply NO ${job.refCode} to reject.`;

    try {
        const result = await sendSms({ to: job.hrPhone, body });
        const now = new Date();
        await Interview.updateMany(
            { _id: { $in: interviews.map((interview) => interview._id) } },
            {
                $set: { status: "hr_notified", hrSmsSid: result.sid, hrNotifiedAt: now },
                $push: { logs: { event: "hr_notified", detail: `SMS sent to ${job.hrPhone}` } }
            }
        );
        return { notified: true, sid: result.sid, dryRun: Boolean(result.dryRun) };
    } catch (error) {
        console.error("HR notification failed", error.message);
        return { notified: false, reason: error.message };
    }
};

export const callHrForJob = async (job, interviews) => {
    if (!interviews.length) {
        return { called: false, reason: "No matching candidates found" };
    }

    try {
        const result = await callHr({
            to: job.hrPhone,
            jobTitle: job.title,
            company: job.company,
            candidateCount: interviews.length,
            jobId: String(job._id)
        });

        await Interview.updateMany(
            { _id: { $in: interviews.map((interview) => interview._id) } },
            {
                $push: { logs: { event: "hr_called", detail: `Automated HR call placed to ${job.hrPhone} (sid: ${result.sid})` } }
            }
        );

        return { called: true, sid: result.sid, dryRun: Boolean(result.dryRun) };
    } catch (error) {
        console.error("HR call failed", error.message);
        return { called: false, reason: error.message };
    }
};

export const callSelectedCandidate = async (interview) => {
    const job = interview.job;
    const candidate = interview.candidate;

    try {
        const result = await callCandidate({
            to: interview.profile?.phone || interview.candidate?.phone,
            candidateName: candidate?.name || "candidate",
            jobTitle: job?.title || "the open role",
            company: job?.company || "the company",
            interviewDateTime: job?.interviewDateTime,
            hrName: job?.hrName,
            hrPhone: job?.hrPhone
        });

        interview.status = "candidate_called";
        interview.callSid = result.sid;
        interview.callStatus = result.status;
        interview.candidateCalledAt = new Date();
        interview.logs.push({ event: "candidate_called", detail: `Call placed to ${interview.profile?.phone || "candidate"} (sid: ${result.sid})` });
        await interview.save();
        return { called: true, ...result };
    } catch (error) {
        interview.status = "failed";
        interview.logs.push({ event: "call_failed", detail: error.message });
        await interview.save();
        return { called: false, reason: error.message };
    }
};

export const confirmInterviews = async (interviews) => {
    const results = [];

    for (const interview of interviews) {
        interview.status = "hr_confirmed";
        interview.hrRespondedAt = new Date();
        interview.logs.push({ event: "hr_confirmed", detail: "HR confirmed the interview" });
        await interview.save();

        const result = await callSelectedCandidate(interview);
        results.push({ interview: interview._id, ...result });
    }

    return results;
};
