import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    company: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ""
    },
    skills: [{
        type: String
    }],
    experienceYears: {
        type: Number,
        default: 0
    },
    education: {
        type: String,
        enum: ["any", "high_school", "bachelors", "masters", "phd"],
        default: "any"
    },
    location: {
        type: String,
        default: ""
    },
    jobType: {
        type: String,
        default: "full-time"
    },
    interviewDateTime: {
        type: Date
    },
    refCode: {
        type: String,
        unique: true
    },
    hrName: {
        type: String,
        default: "HR"
    },
    hrPhone: {
        type: String,
        required: true
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    status: {
        type: String,
        enum: ["active", "closed"],
        default: "active"
    },
    matchThreshold: {
        type: Number,
        default: 50
    }
}, { timestamps: true });

const Job = mongoose.model("Job", jobSchema);

export default Job;
