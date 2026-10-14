import "dotenv/config";
import mongoose from "mongoose";
import User from "./models/user.model.js";
import Profile from "./models/profile.model.js";
import Job from "./models/job.model.js";
import Interview from "./models/interview.model.js";

const seedManualTest = async () => {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Connected to", mongoose.connection.name);

    let company = await User.findOne({ email: "demo@company.com" });
    if (!company) {
        company = await User.create({
            name: "Demo Company",
            email: "demo@company.com",
            role: "company",
            companyName: "Test Hiring Co",
            website: "https://testhiring.com",
            about: "Demo company for testing manual approve"
        });
    }
    console.log(`Company: ${company.companyName} <${company.email}>`);

    const demoCandidates = [
        { name: "Rahul Verma", email: "rahul.demo@test.com", phone: "+919000000001", skills: ["react", "javascript", "tailwind", "redux"], headline: "Frontend Developer", experienceYears: 3, location: "Mumbai", education: "bachelors" },
        { name: "Sneha Kulkarni", email: "sneha.demo@test.com", phone: "+919000000002", skills: ["node.js", "express", "mongodb", "aws"], headline: "Backend Developer", experienceYears: 4, location: "Pune", education: "bachelors" },
        { name: "Amit Joshi", email: "amit.demo@test.com", phone: "+919000000003", skills: ["python", "django", "postgresql", "docker"], headline: "Python Developer", experienceYears: 5, location: "Delhi", education: "masters" },
        { name: "Priya Desai", email: "priya.demo@test.com", phone: "+919000000004", skills: ["figma", "ui/ux", "prototyping", "react"], headline: "Product Designer", experienceYears: 3, location: "Bengaluru", education: "bachelors" },
        { name: "Rohan Gupta", email: "rohan.demo@test.com", phone: "+919000000005", skills: ["react", "node.js", "typescript", "mongodb"], headline: "Fullstack MERN Developer", experienceYears: 2, location: "Chennai", education: "bachelors" }
    ];

    const candidateUsers = [];
    for (const c of demoCandidates) {
        let user = await User.findOne({ email: c.email });
        if (!user) {
            user = await User.create({ name: c.name, email: c.email, role: "candidate" });
        }
        await Profile.findOneAndUpdate(
            { user: user._id },
            {
                $set: {
                    phone: c.phone,
                    headline: c.headline,
                    skills: c.skills,
                    experienceYears: c.experienceYears,
                    education: c.education,
                    location: c.location,
                    openToWork: true
                }
            },
            { upsert: true }
        );
        candidateUsers.push(user);
    }
    console.log(`Candidates: ${candidateUsers.length} profiles`);

    const job = await Job.findOneAndUpdate(
        { refCode: "TEST99" },
        {
            $set: {
                title: "Senior MERN Developer",
                company: "Test Hiring Co",
                description: "Looking for a senior MERN developer with React and Node.js experience.",
                skills: ["react", "node.js", "mongodb", "express", "javascript"],
                experienceYears: 2,
                education: "bachelors",
                location: "Remote",
                jobType: "full-time",
                interviewDateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                hrName: "Demo HR",
                hrPhone: "+919000000000",
                postedBy: company._id,
                status: "active"
            },
            $setOnInsert: { refCode: "TEST99" }
        },
        { upsert: true, returnDocument: "after" }
    );
    console.log(`Job: ${job.title} [${job.refCode}]`);

    const statuses = ["hr_notified", "matched", "hr_notified", "matched", "hr_notified"];
    for (let i = 0; i < candidateUsers.length; i++) {
        const user = candidateUsers[i];
        const profile = await Profile.findOne({ user: user._id });
        const now = new Date();
        const interview = await Interview.findOneAndUpdate(
            { job: job._id, candidate: user._id },
            {
                $set: {
                    matchScore: 75 + i * 5,
                    matchedSkills: demoCandidates[i].skills.slice(0, 3),
                    missingSkills: demoCandidates[i].skills.slice(3),
                    status: statuses[i],
                    hrNotifiedAt: now,
                    logs: [
                        { event: "matched", detail: `Demo seed match ${75 + i * 5}%` },
                        { event: statuses[i], detail: "Demo — pending for manual approve" }
                    ]
                },
                $setOnInsert: { job: job._id, candidate: user._id, profile: profile?._id }
            },
            { upsert: true, returnDocument: "after" }
        );
        console.log(`  ${user.name} → ${statuses[i]} (${interview.matchScore}%)`);
    }

    console.log("\nDemo data ready!");
    console.log(`Login as company: demo@company.com`);
    console.log(`Go to /company → Matched candidates → Test Manual Approve button`);
    await mongoose.disconnect();
};

seedManualTest().catch((err) => {
    console.error("Demo seed failed:", err.message);
    process.exit(1);
});