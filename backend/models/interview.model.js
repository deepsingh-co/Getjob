import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema({
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
        required: true
    },
    candidate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    profile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Profile"
    },
    matchScore: {
        type: Number,
        default: 0
    },
    matchedSkills: [{
        type: String
    }],
    missingSkills: [{
        type: String
    }],
    status: {
        type: String,
        enum: [
            "matched",
            "hr_notified",
            "hr_confirmed",
            "candidate_called",
            "human_review",
            "follow_up",
            "delayed",
            "next_job",
            "rejected",
            "failed"
        ],
        default: "matched"
    },
    hrSmsSid: {
        type: String,
        default: ""
    },
    hrNotifiedAt: {
        type: Date
    },
    hrRespondedAt: {
        type: Date
    },
    callSid: {
        type: String,
        default: ""
    },
    callStatus: {
        type: String,
        default: ""
    },
    candidateCalledAt: {
        type: Date
    },
    logs: [{
        event: String,
        detail: String,
        at: {
            type: Date,
            default: Date.now
        }
    }]
}, { timestamps: true });

interviewSchema.index({ job: 1, candidate: 1 }, { unique: true });

const Interview = mongoose.model("Interview", interviewSchema);

export default Interview;
