import Job from "../models/job.model.js";
import Interview from "../models/interview.model.js";
import Profile from "../models/profile.model.js";
import { generateRefCode, matchCandidatesForJob, notifyHr, callHrForJob } from "../services/hiring.service.js";
import { matchProfileToJob } from "../services/matching.service.js";

export const createJob = async (req, res) => {
    try {
        const {
            title,
            company,
            description,
            skills,
            experienceYears,
            education,
            location,
            jobType,
            interviewDateTime,
            hrName,
            hrPhone,
            matchThreshold
        } = req.body;

        if (!title || !company || !hrPhone) {
            return res.status(400).json({ message: "title, company and hrPhone are required" });
        }

        const job = await Job.create({
            title,
            company,
            description,
            skills: Array.isArray(skills)
                ? skills
                : String(skills || "").split(",").map((skill) => skill.trim()).filter(Boolean),
            experienceYears: Number(experienceYears) || 0,
            education,
            location,
            jobType,
            interviewDateTime: interviewDateTime ? new Date(interviewDateTime) : undefined,
            hrName: hrName || "HR",
            hrPhone,
            matchThreshold: Number(matchThreshold) || 50,
            refCode: generateRefCode(),
            postedBy: req.userId
        });

        const interviews = await matchCandidatesForJob(job);
        const notification = await notifyHr(job, interviews);
        const hrCall = await callHrForJob(job, interviews);

        const matches = await Interview.find({ job: job._id })
            .populate("candidate", "name email")
            .populate("profile", "phone skills experienceYears education location");

        return res.status(201).json({ job, matches, notification, hrCall });
    } catch (error) {
        return res.status(500).json({ message: `Failed to create job ${error.message}` });
    }
};

export const getJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ postedBy: req.userId }).sort({ createdAt: -1 });
        return res.status(200).json(jobs);
    } catch (error) {
        return res.status(500).json({ message: `Failed to get jobs ${error.message}` });
    }
};

export const getJobMatches = async (req, res) => {
    try {
        const matches = await Interview.find({ job: req.params.id })
            .populate("candidate", "name email")
            .populate("profile", "phone skills experienceYears education location")
            .sort({ matchScore: -1 });

        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        return res.status(200).json({ job, matches });
    } catch (error) {
        return res.status(500).json({ message: `Failed to get matches ${error.message}` });
    }
};

export const getMatchedProfiles = async (req, res) => {
    try {
        const profiles = await Profile.find({ openToWork: true }).populate("user", "name email");
        return res.status(200).json(profiles);
    } catch (error) {
        return res.status(500).json({ message: `Failed to get profiles ${error.message}` });
    }
};

export const getOpenJobs = async (req, res) => {
    try {
        const [jobs, profile, myInterviews] = await Promise.all([
            Job.find({ status: "active" }).sort({ createdAt: -1 }),
            Profile.findOne({ user: req.userId }),
            Interview.find({ candidate: req.userId }).select("job status matchScore matchedSkills missingSkills")
        ]);

        const interviewByJob = new Map(
            myInterviews.map((interview) => [String(interview.job), interview])
        );

        const payload = jobs.map((job) => {
            const mine = interviewByJob.get(String(job._id));
            const match = profile ? matchProfileToJob(job, profile) : null;

            return {
                ...job.toObject(),
                applied: Boolean(mine),
                applicationStatus: mine?.status || "",
                matchScore: mine?.matchScore ?? match?.score ?? null,
                matchedSkills: mine?.matchedSkills ?? match?.matchedSkills ?? [],
                missingSkills: mine?.missingSkills ?? match?.missingSkills ?? []
            };
        });

        return res.status(200).json(payload);
    } catch (error) {
        return res.status(500).json({ message: `Failed to get open jobs ${error.message}` });
    }
};
