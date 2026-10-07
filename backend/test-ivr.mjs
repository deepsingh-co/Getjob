import "dotenv/config";
import crypto from "crypto";
import mongoose from "mongoose";
import Job from "./models/job.model.js";
import Interview from "./models/interview.model.js";
import User from "./models/user.model.js";
import { buildHrCallTwiml, buildCandidateCallTwiml } from "./services/twilio.service.js";

const BASE = "http://localhost:8000";

const sign = (url, params, token) => {
    const sorted = Object.keys(params).sort();
    let data = url;
    for (const key of sorted) data += key + params[key];
    return crypto.createHmac("sha1", token).update(Buffer.from(data, "utf8")).digest("base64");
};

const post = async (path, params) => {
    const url = BASE + path;
    const body = new URLSearchParams(params).toString();
    const signature = sign(url, params, process.env.TWILIO_AUTH_TOKEN);
    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "X-Twilio-Signature": signature
        },
        body
    });
    return { status: res.status, text: await res.text() };
};

const run = async () => {
    // 1. verify Twilio credentials (read-only)
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const auth = Buffer.from(`${sid}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64");
    const account = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}.json`, {
        headers: { Authorization: `Basic ${auth}` }
    }).then(async (r) => ({ s: r.status, d: await r.json().catch(() => ({})) }));
    console.log("[twilio] account check:", account.s, account.d.friendly_name || account.d.message || "", "| status:", account.d.status || "-");

    // 2. TwiML sanity
    const hrTwiml = buildHrCallTwiml({ jobTitle: "Frontend Engineer", company: "Acme", candidateCount: 5, jobId: "abc123" });
    const candTwiml = buildCandidateCallTwiml({ candidateName: "Ritika", jobTitle: "Frontend Engineer", company: "Acme", interviewDateTime: new Date(), hrName: "Arjun", hrPhone: "+911234567890" });
    console.log("[twiml] HR gather actions:", (hrTwiml.match(/action="[^"]+"/g) || []).join(", "));
    console.log("[twiml] HR menu keys:", /Press 1 to confirm the shortlist/.test(hrTwiml) && /Press 2 for human review/.test(hrTwiml) && /Press 3 to cancel/.test(hrTwiml) && /Press 4 to schedule a follow up/.test(hrTwiml) ? "1/2/3/4 OK" : "MISSING");
    console.log("[twiml] Candidate menu keys:", /Press 1 to confirm/.test(candTwiml) && /Press 2 if you cannot confirm/.test(candTwiml) && /Press 3 to delay/.test(candTwiml) && /Press 4 to be considered/.test(candTwiml) ? "1/2/3/4 OK" : "MISSING");

    await mongoose.connect(process.env.MONGODB_URL);

    // 3. temp HR gather test
    const company = await User.findOne({ role: "company" });
    const candidate = await User.findOne({ role: "candidate" });
    const job = await Job.create({
        title: "IVR Test Role", company: "IVR Test Co", skills: ["react"], hrPhone: "+15005550006",
        refCode: "IVR999", postedBy: company._id, status: "active"
    });
    const interview = await Interview.create({ job: job._id, candidate: candidate._id, matchScore: 80, status: "hr_notified" });

    const hr1 = await post(`/api/hiring/twilio/hr-gather?job=${job._id}`, { Digits: "2", CallSid: "CA_hr_test" });
    const after2 = (await Interview.findById(interview._id)).status;
    console.log("[hr-gather digit 2] http", hr1.status, "| status now:", after2, "|", (hr1.text.match(/<Say[^>]*>([^<]+)/) || [])[1]?.slice(0, 80));

    const hr4 = await post(`/api/hiring/twilio/hr-gather?job=${job._id}`, { Digits: "4", CallSid: "CA_hr_test" });
    const after4 = (await Interview.findById(interview._id)).status;
    console.log("[hr-gather digit 4] http", hr4.status, "| status now:", after4);

    // 4. temp candidate gather test (reuse the same interview, give it a callSid)
    interview.callSid = "CA_cand_test";
    interview.status = "candidate_called";
    await interview.save();

    const c3 = await post("/api/hiring/twilio/candidate-gather", { Digits: "3", CallSid: "CA_cand_test" });
    const c3After = (await Interview.findById(interview._id)).status;
    console.log("[candidate-gather digit 3] http", c3.status, "| status now:", c3After, "|", (c3.text.match(/<Say[^>]*>([^<]+)/) || [])[1]?.slice(0, 80));

    interview.status = "candidate_called";
    await interview.save();
    const c1 = await post("/api/hiring/twilio/candidate-gather", { Digits: "1", CallSid: "CA_cand_test" });
    console.log("[candidate-gather digit 1] http", c1.status, "|", (c1.text.match(/<Say[^>]*>([^<]+)/) || [])[1]?.slice(0, 80));

    // 5. cleanup temp data
    await Interview.deleteMany({ job: job._id });
    await Job.deleteOne({ _id: job._id });
    console.log("[cleanup] temp job/interviews removed");

    await mongoose.disconnect();
};

run().catch((e) => { console.error("TEST FAILED:", e.message); process.exit(1); });
