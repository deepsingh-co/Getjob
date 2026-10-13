import mongoose from "mongoose";
import "dotenv/config";
import User from "./models/user.model.js";
import Profile from "./models/profile.model.js";
import Job from "./models/job.model.js";
import Interview from "./models/interview.model.js";
import Work from "./models/work.model.js";

const COMPANIES = [
  {name: "TechCorp", email: "hr@techcorp.com", companyName: "TechCorp Inc", website: "https://techcorp.com", about: "Software development company"},
  {name: "DataInsights", email: "analytics@data.com", companyName: "DataInsights", website: "https://data.com", about: "Data analytics and AI company"},
  {name: "HealthSystems", email: "contact@healthsys.com", companyName: "HealthSystems", website: "https://healthsys.com", about: "Healthcare technology company"},
  {name: "FinanceGroup", email: "finance@bank.com", companyName: "FinanceGroup", website: "https://financegroup.com", about: "Financial services company"},
  {name: "EduLearn", email: "careers@edulearn.com", companyName: "EduLearn", website: "https://edulearn.com", about: "Education technology company"},
  {name: "AutoMotive", email: "careers@automotive.com", companyName: "AutoMotive", website: "https://automotive.com", about: "Automotive parts company"},
  {name: "RetailChain", email: "hr@retailchain.com", companyName: "RetailChain", website: "https://retailchain.com", about: "Retail company with 50+ stores"},
  {name: "EnergyCorp", email: "energy@energy.com", companyName: "EnergyCorp", website: "https://energycorp.com", about: "Energy and utility company"},
  {name: "FoodNetwork", email: "jobs@foodnet.com", companyName: "FoodNetwork", website: "https://foodnetwork.com", about: "Food and beverage company"},
  {name: "CreativeStudio", email: "design@creative.com", companyName: "CreativeStudio", website: "https://creativestudio.com", about: "Creative agency and design firm"}
];

const FIRST_NAMES = ["John", "Mike", "Sarah", "David", "Lisa", "Robert", "Maria", "William", "Ashley", "Christopher", "Daniel", "Jennifer", "Matthew", "Amy", "Michael", "Elizabeth", "Daniel", "Sarah", "Robert", "Maria"];
const LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Martin", "Jackson"];
const DOMAINS = ["gmail.com", "outlook.com", "yahoo.com", "company.com"];

async function addDemoData() {
  await mongoose.connect(process.env.MONGODB_URL);
  console.log("Connected to", mongoose.connection.name);

  // Add 20 companies
  console.log("Adding 20 companies...");
  const companyUsers = [];
  for (let i = 0; i < 20; i++) {
    const company = COMPANIES[i % COMPANIES.length];
    const email = `${FIRST_NAMES[i].toLowerCase()}.${LAST_NAMES[i].toLowerCase()}@demo.com`;
    const user = await User.findOneAndUpdate(
      {email},
      {$setOnInsert: {name: `${FIRST_NAMES[i]} ${LAST_NAMES[i]}`, email, role: "company", companyName: company.companyName, website: company.website, about: company.about}},
      {upsert: true, new: true}
    );
    companyUsers.push(user);
  }
  console.log("Companies added:", companyUsers.length);

  // Add 50 candidates
  console.log("Adding 50 candidates...");
  candidateEmails = [];
  for (let i = 0; i < 50; i++) {
    const email = `${FIRST_NAMES[i % FIRST_NAMES.length].toLowerCase()}.${LAST_NAMES[i % LAST_NAMES.length].toLowerCase()}@${DOMAINS[i % DOMAINS.length]}`;
    candidateEmails.push(email);
    const user = await User.findOneAndUpdate(
      {email},
      {$setOnInsert: {name: `${FIRST_NAMES[i % FIRST_NAMES.length]} ${LAST_NAMES[i % LAST_NAMES.length]}`, email, role: "candidate"}},
      {upsert: true, new: true}
    );
    
    // Add profile if not exists
    await Profile.findOneAndUpdate(
      {user: user._id},
      {$set: {phone: `+919${String(i).padStart(8, "0")}`, headline: `${FIRST_NAMES[i % FIRST_NAMES.length]} ${LAST_NAMES[i % LAST_NAMES.length]} - ${i > 25 ? "Senior" : "Junior"} Developer`, skills: i < 30 ? ["javascript", "react", "node.js"] : ["python", "machine learning", "aws"], experienceYears: i < 30 ? 3 : 7, education: i < 20 ? "bachelors" : "masters", location: i < 30 ? "Bengaluru" : i < 40 ? "Hyderabad" : "Pune", summary: `Demo candidate ${i + 1} with ${i < 30 ? "frontend" : "backend"} skills`, openToWork: true}},
      {upsert: true}
    );
  }
  console.log("Candidates added: 50");

  // Add 10 jobs posted by first 10 companies
  console.log("Adding 10 jobs...");
  const jobs = [];
  for (let i = 0; i < 10; i++) {
    const company = companyUsers[i];
    const job = await Job.create({
      title: `Senior ${i === 0 ? "React" : i === 1 ? "Node.js" : i === 2 ? "AI/ML" : i === 3 ? "Product Designer" : i === 4 ? "Data Scientist" : i === 5 ? "DevOps Engineer" : i === 5 ? "QA Engineer" : i === 6 ? "Full Stack" : i === 6 ? "Mobile Developer" : i === 7 ? "Technical Writer" : "Technical Writer"} Developer`,
      company: company.companyName,
      description: `Job description for ${company.companyName} - position ${i + 1}`,
      skills: i < 5 ? ["react", "javascript", "typescript"] : i < 10 ? ["python", "django", "aws"] : ["go", "docker", "kubernetes"],
      experienceYears: i % 2 === 0 ? 5 : 3,
      education: i % 2 === 0 ? "masters" : "bachelors",
      location: i < 10 ? "Bangalore" : i < 20 ? "Hyderabad" : "Pune",
      jobType: "full-time",
      hrName: "HR Contact",
      hrPhone: `+9198${String(i + 100).padStart(8, "0")}`,
      refCode: `DEMO${String(i + 100).padStart(3, "0")}`,
      postedBy: company._id,
      status: "active"
    });
    jobs.push(job);
  }
  console.log("Jobs added: 10");

  // Add interviews for first 5 jobs with 3 candidates each
  console.log("Adding interviews...");
  const allProfiles = await Profile.find({openToWork: true}).limit(50).populate("user");
  let interviewCount = 0;
  for (let jobIdx = 0; jobIdx < 5; jobIdx++) {
    const job = jobs[jobIdx];
    const interviewed = allProfiles.slice(jobIdx * 3, jobIdx * 3 + 3);
    for (const profile of interviewed) {
      if (!profile.user) continue;
      const statusOptions = ["matched", "hr_notified", "hr_confirmed", "candidate_called"];
      const status = statusOptions[Math.floor(Math.random() * statusOptions.length)];
      const interview = await Interview.create({
        job: job._id,
        candidate: profile.user._id,
        profile: profile._id,
        matchScore: 60 + Math.random() * 30,
        matchedSkills: ["javascript", "react"],
        missingSkills: ["node.js", "aws"],
        status: status,
        hrNotifiedAt: status !== "matched" ? new Date() : undefined,
        hrRespondedAt: status !== "matched" ? new Date() : undefined,
        candidateCalledAt: status === "candidate_called" ? new Date() : undefined,
        callSid: status === "candidate_called" ? `DEMO${Math.random().toString(36).substr(2, 8).toUpperCase()}` : undefined,
        callStatus: status === "candidate_called" ? "completed" : undefined,
        logs: [{event: "matched", detail: "Demo interview"}]
      });
      interviewCount++;
    }
  }
  console.log("Interviews added:", interviewCount);

  // Add 5 works
  console.log("Adding 5 works...");
  const workTitles = ["Platform Dashboard", "API Documentation", "Mobile App", "Analytics Report", "User Portal"];
  for (let i = 0; i < 5; i++) {
    await Work.create({
      title: workTitles[i],
      description: `Work description ${i + 1}`,
      category: i % 2 === 0 ? "project" : "product",
      tags: ["demo", "work"],
      image: `demo-${i + 1}.jpg`,
      companyName: companyUsers[i % companyUsers.length].companyName,
      uploadedBy: companyUsers[i % companyUsers.length]._id,
      status: "published"
    });
  }
  console.log("Works added: 5");

  console.log("\n=== Demo data addition complete ===");
  await mongoose.disconnect();
}

addDemoData().catch(err => {
  console.error("Error:", err.message);
  process.exit(1);
});