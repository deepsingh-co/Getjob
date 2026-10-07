import "dotenv/config";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import User from "./models/user.model.js";
import Profile from "./models/profile.model.js";
import Job from "./models/job.model.js";
import Interview from "./models/interview.model.js";
import Work from "./models/work.model.js";
import { matchCandidatesForJob } from "./services/hiring.service.js";
import { matchProfileToJob } from "./services/matching.service.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetDir = path.resolve(__dirname, "..", "frontend", "src", "assets");
const uploadDir = path.join(__dirname, "uploads");

const argValue = (name) => {
    const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
    return hit ? hit.split("=").slice(1).join("=") : "";
};

const companies = [
    {
        name: "Arjun Mehta",
        email: "founder@nexlify.dev",
        companyName: "Nexlify Labs",
        website: "https://nexlifylabs.com",
        about: "Product engineering studio building AI-first hiring, fintech and growth platforms for startups across India."
    },
    {
        name: "Priya Nair",
        email: "priya@orbitfintech.in",
        companyName: "Orbit Fintech",
        website: "https://orbitfintech.in",
        about: "Neobank infrastructure company. We ship payments, ledger and underwriting products used by 40+ NBFCs."
    }
];

const candidates = [
    {
        name: "Ritika Sharma",
        email: "ritika.sharma.dev@gmail.com",
        phone: "+919876543210",
        headline: "Frontend Engineer · React & design systems",
        skills: ["react", "javascript", "tailwind", "redux", "typescript"],
        experienceYears: 4,
        education: "bachelors",
        location: "Bengaluru",
        summary: "4 years building dashboards and design systems. Led the migration of a 200-screen admin panel to React 18."
    },
    {
        name: "Karthik Reddy",
        email: "karthik.reddy.dev@gmail.com",
        phone: "+919876543211",
        headline: "Backend Engineer · Node.js & AWS",
        skills: ["node.js", "express", "mongodb", "aws", "redis"],
        experienceYears: 3,
        education: "bachelors",
        location: "Bengaluru",
        summary: "Owns order-service doing 2M events/day. Comfortable with queues, caching and cost-aware AWS setups."
    },
    {
        name: "Ayesha Khan",
        email: "ayesha.khan.ml@gmail.com",
        phone: "+919876543212",
        headline: "ML Engineer · NLP & ranking",
        skills: ["python", "pytorch", "nlp", "sql", "mlops"],
        experienceYears: 5,
        education: "masters",
        location: "Hyderabad",
        summary: "Shipped resume-ranking and intent models to production. MLOps with MLflow and lightweight serving."
    },
    {
        name: "Dev Patel",
        email: "dev.patel.design@gmail.com",
        phone: "+919876543213",
        headline: "Product Designer · B2B SaaS",
        skills: ["figma", "ui/ux", "prototyping", "design systems"],
        experienceYears: 3,
        education: "bachelors",
        location: "Pune",
        summary: "Designs dense B2B workflows. Owns a component library used by 6 product squads."
    },
    {
        name: "Sneha Iyer",
        email: "sneha.iyer.dev@gmail.com",
        phone: "+919876543214",
        headline: "Fullstack Engineer · MERN",
        skills: ["react", "node.js", "mongodb", "express", "javascript"],
        experienceYears: 2,
        education: "bachelors",
        location: "Chennai",
        summary: "Shipped 3 customer-facing products end to end, from schema to CI/CD."
    },
    {
        name: "Vikram Singh",
        email: "vikram.singh.dev@gmail.com",
        phone: "+919876543215",
        headline: "Data Engineer · SQL & pipelines",
        skills: ["python", "sql", "airflow", "aws"],
        experienceYears: 4,
        education: "bachelors",
        location: "Delhi",
        summary: "Built warehouse pipelines feeding finance reporting for a Series B marketplace."
    }
];

const jobs = [
    {
        refCode: "FRT201",
        companyIndex: 0,
        title: "Senior Frontend Engineer",
        description: "Own our recruiter-facing web app: matching UI, dashboards and design system. React 18, TypeScript, Tailwind.",
        skills: ["react", "javascript", "tailwind", "redux"],
        experienceYears: 3,
        education: "bachelors",
        location: "Bengaluru",
        jobType: "full-time",
        hrName: "Arjun Mehta",
        hrPhone: "+919810011111",
        daysFromNow: 3
    },
    {
        refCode: "BCK302",
        companyIndex: 0,
        title: "Backend Engineer (Node.js)",
        description: "Build the hiring pipeline APIs: matching, Twilio SMS/calls, webhooks. Node, Express, MongoDB, AWS.",
        skills: ["node.js", "express", "mongodb", "aws"],
        experienceYears: 2,
        education: "bachelors",
        location: "Bengaluru",
        jobType: "full-time",
        hrName: "Arjun Mehta",
        hrPhone: "+919810011111",
        daysFromNow: 5
    },
    {
        refCode: "AIM403",
        companyIndex: 1,
        title: "AI / ML Engineer",
        description: "Resume ranking, interview scoring and fraud signals. Python, PyTorch, SQL, production MLOps.",
        skills: ["python", "pytorch", "nlp", "sql"],
        experienceYears: 4,
        education: "masters",
        location: "Hyderabad",
        jobType: "full-time",
        hrName: "Priya Nair",
        hrPhone: "+919820022222",
        daysFromNow: 4
    },
    {
        refCode: "DSG504",
        companyIndex: 1,
        title: "Product Designer",
        description: "Design dashboards and onboarding for underwriting tools. Figma, systems thinking, prototyping.",
        skills: ["figma", "ui/ux", "prototyping"],
        experienceYears: 2,
        education: "bachelors",
        location: "Pune",
        jobType: "full-time",
        hrName: "Priya Nair",
        hrPhone: "+919820022222",
        daysFromNow: 6
    }
];

const works = [
    {
        companyIndex: 0,
        title: "Resume AI Scan Engine",
        description: "Skill extraction and gap detection over 10k resumes in under 400ms per document.",
        category: "product",
        tags: ["AI", "resumes", "NLP"],
        image: "resume.png"
    },
    {
        companyIndex: 0,
        title: "Interview Confirmation Flow",
        description: "SMS shortlist to HR, YES/NO reply, automated candidate call — zero manual scheduling.",
        category: "case_study",
        tags: ["twilio", "automation", "hiring"],
        image: "confi.png"
    },
    {
        companyIndex: 1,
        title: "Mock Interview Module",
        description: "Voice + text mock interviews with scored feedback across 12 question types.",
        category: "product",
        tags: ["interviews", "scoring"],
        image: "MM.png"
    },
    {
        companyIndex: 1,
        title: "Tech Screening Dashboard",
        description: "Role-wise candidate pipeline with match scores and drop-off analytics.",
        category: "project",
        tags: ["dashboard", "analytics"],
        image: "tech.png"
    }
];

const interviewVariety = ["candidate_called", "hr_confirmed", "hr_notified", "matched"];

const TEST_EMAIL = /@(example\.com|e\.com)$/i;

const upsertCompany = async (email, data) => {
    const existing = await User.findOne({ email });
    if (existing) {
        existing.role = "company";
        if (!existing.companyName) existing.companyName = data.companyName;
        if (!existing.website) existing.website = data.website;
        if (!existing.about) existing.about = data.about;
        await existing.save();
        return existing;
    }
    return User.create({ ...data, email, role: "company" });
};

const upsertCandidate = async (email, data) => {
    const existing = await User.findOne({ email });
    if (existing) {
        existing.role = "candidate";
        await existing.save();
        return existing;
    }
    return User.create({ ...data, email, role: "candidate" });
};

const cleanupTestData = async () => {
    const testUsers = await User.find({ email: TEST_EMAIL }, { _id: 1 });
    const ids = testUsers.map((user) => user._id);
    if (!ids.length) return 0;

    const testJobs = await Job.find({ postedBy: { $in: ids } }, { _id: 1 });
    const jobIds = testJobs.map((job) => job._id);

    await Interview.deleteMany({ $or: [{ candidate: { $in: ids } }, { job: { $in: jobIds } }] });
    await Work.deleteMany({ uploadedBy: { $in: ids } });
    await Job.deleteMany({ _id: { $in: jobIds } });
    await Profile.deleteMany({ user: { $in: ids } });
    await User.deleteMany({ _id: { $in: ids } });
    return ids.length;
};

const seed = async () => {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Connected to", mongoose.connection.name);

    const removed = await cleanupTestData();
    if (removed) console.log(`Removed ${removed} throwaway test accounts and their data`);
    await User.updateMany({ role: { $exists: false } }, { $set: { role: "candidate" } });

    const existingCompany = await User.findOne({
        role: "company",
        email: { $nin: companies.map((company) => company.email), $not: TEST_EMAIL }
    }).sort({ createdAt: -1 });
    const companyEmail = argValue("company-email") || process.env.SEED_COMPANY_EMAIL ||
        existingCompany?.email || companies[0].email;
    const candidateEmail = argValue("candidate-email") || process.env.SEED_CANDIDATE_EMAIL || candidates[0].email;

    const companyUsers = [];
    for (const [index, company] of companies.entries()) {
        const email = index === 0 ? companyEmail : company.email;
        const user = await upsertCompany(email, company);
        companyUsers.push(user);
        console.log(`Company ${index + 1}: ${user.companyName} <${email}>`);
    }

    const profileUsers = [];
    for (const [index, candidate] of candidates.entries()) {
        const email = index === 0 ? candidateEmail : candidate.email;
        const user = await upsertCandidate(email, { name: candidate.name });
        profileUsers.push(user);

        await Profile.findOneAndUpdate(
            { user: user._id },
            {
                $set: {
                    phone: candidate.phone,
                    headline: candidate.headline,
                    skills: candidate.skills,
                    experienceYears: candidate.experienceYears,
                    education: candidate.education,
                    location: candidate.location,
                    summary: candidate.summary,
                    openToWork: true
                }
            },
            { upsert: true }
        );
    }
    console.log(`Candidates: ${candidates.length} profiles`);

    const covered = new Set(profileUsers.map((user) => user._id.toString()));
    const existingAccountIds = [];
    const extraAccounts = await User.find({
        role: { $ne: "company" },
        email: { $nin: candidates.map((candidate) => candidate.email), $not: TEST_EMAIL }
    }).limit(5);

    for (const [index, account] of extraAccounts.entries()) {
        existingAccountIds.push(account._id);
        if (covered.has(account._id.toString())) continue;
        const already = await Profile.findOne({ user: account._id });
        if (already) continue;

        await Profile.create({
            user: account._id,
            phone: `+9190000001${String(index).padStart(2, "0")}`,
            headline: "Fullstack Developer (MERN)",
            skills: ["react", "node.js", "javascript", "mongodb", "express"],
            experienceYears: 3,
            education: "bachelors",
            location: "Bengaluru",
            summary: "Demo profile added by the seed so this account shows live matches and interview activity.",
            openToWork: true
        });
        console.log(`Existing account given a demo profile: ${account.email}`);
    }

    const jobDocs = [];
    for (const job of jobs) {
        const interviewDateTime = new Date();
        interviewDateTime.setDate(interviewDateTime.getDate() + job.daysFromNow);
        interviewDateTime.setHours(11, 0, 0, 0);

        const doc = await Job.findOneAndUpdate(
            { refCode: job.refCode },
            {
                $set: {
                    title: job.title,
                    company: companyUsers[job.companyIndex].companyName,
                    description: job.description,
                    skills: job.skills,
                    experienceYears: job.experienceYears,
                    education: job.education,
                    location: job.location,
                    jobType: job.jobType,
                    interviewDateTime,
                    hrName: job.hrName,
                    hrPhone: job.hrPhone,
                    postedBy: companyUsers[job.companyIndex]._id,
                    status: "active"
                },
                $setOnInsert: { refCode: job.refCode }
            },
            { upsert: true, returnDocument: "after" }
        );
        jobDocs.push(doc);
    }
    console.log(`Jobs: ${jobDocs.length} open roles`);

    let totalInterviews = 0;
    for (const job of jobDocs) {
        const interviews = await matchCandidatesForJob(job);
        for (const [index, interview] of interviews.entries()) {
            if (interview.status !== "matched") continue;
            const status = interviewVariety[index % interviewVariety.length];
            const now = new Date();
            interview.status = status;
            if (status !== "matched") interview.hrNotifiedAt = now;
            if (status === "hr_confirmed" || status === "candidate_called") interview.hrRespondedAt = now;
            if (status === "candidate_called") {
                interview.candidateCalledAt = now;
                interview.callSid = "SEEDCALL" + interview._id.toString().slice(-8).toUpperCase();
                interview.callStatus = "completed";
            }
            interview.logs.push({ event: status, detail: "Seeded demo activity" });
            await interview.save();
        }
        totalInterviews += interviews.length;
        console.log(`  ${job.refCode} ${job.title}: ${interviews.length} matched`);
    }

    let existingDemo = 0;
    if (existingAccountIds.length) {
        const existingProfiles = await Profile.find({ user: { $in: existingAccountIds } }).populate("user");
        for (const [index, profile] of existingProfiles.entries()) {
            if (!profile.user) continue;
            if (await Interview.exists({ candidate: profile.user._id })) continue;

            let best = null;
            for (const job of jobDocs) {
                const result = matchProfileToJob(job, profile);
                if (!best || result.score > best.score) best = { job, ...result };
            }
            if (!best) continue;

            const status = interviewVariety[index % interviewVariety.length];
            const finalStatus = status === "matched" ? "hr_confirmed" : status;
            const now = new Date();
            const demoScore = Math.max(best.score, 62);

            await Interview.create({
                job: best.job._id,
                candidate: profile.user._id,
                profile: profile._id,
                matchScore: demoScore,
                matchedSkills: best.matchedSkills,
                missingSkills: best.missingSkills,
                status: finalStatus,
                hrNotifiedAt: now,
                hrRespondedAt: now,
                candidateCalledAt: finalStatus === "candidate_called" ? now : undefined,
                callSid: finalStatus === "candidate_called" ? "SEEDCALL" + index : "",
                callStatus: finalStatus === "candidate_called" ? "completed" : "",
                logs: [
                    { event: "matched", detail: `Match score ${demoScore}% (seeded demo, computed ${best.score}%)` },
                    { event: finalStatus, detail: "Seeded demo activity" }
                ]
            });
            existingDemo += 1;
            console.log(`Existing account demo interview: ${profile.user.email} -> ${finalStatus} (${demoScore}%)`);
        }
    }

    totalInterviews += existingDemo;
    console.log(`Interviews: ${totalInterviews} across all jobs`);

    fs.mkdirSync(uploadDir, { recursive: true });
    let workCount = 0;
    for (const [index, work] of works.entries()) {
        const source = path.join(assetDir, work.image);
        const targetName = `seed-work-${index + 1}${path.extname(work.image)}`;
        if (fs.existsSync(source)) {
            fs.copyFileSync(source, path.join(uploadDir, targetName));
        }

        await Work.findOneAndUpdate(
            { title: work.title },
            {
                $set: {
                    description: work.description,
                    category: work.category,
                    tags: work.tags,
                    image: fs.existsSync(source) ? `/uploads/${targetName}` : "",
                    companyName: companyUsers[work.companyIndex].companyName,
                    uploadedBy: companyUsers[work.companyIndex]._id,
                    status: "published"
                }
            },
            { upsert: true }
        );
        workCount += 1;
    }
    console.log(`Works: ${workCount} published`);

    console.log("\nSeed complete.");
    console.log(`Login as company with Google account: ${companyEmail}`);
    console.log(`Login as candidate with Google account: ${candidateEmail}`);
    console.log("Override with: npm run seed -- --company-email=you@gmail.com --candidate-email=you@gmail.com");

    await mongoose.disconnect();
};

seed().catch((error) => {
    console.error("Seed failed:", error.message);
    process.exit(1);
});
