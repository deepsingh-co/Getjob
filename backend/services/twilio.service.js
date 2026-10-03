import twilio from "twilio";

let client = null;

export const isTwilioConfigured = () => {
    return Boolean(
        process.env.TWILIO_ACCOUNT_SID &&
        process.env.TWILIO_AUTH_TOKEN &&
        process.env.TWILIO_PHONE_NUMBER
    );
};

const getClient = () => {
    if (!isTwilioConfigured()) return null;
    if (!client) {
        client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    }
    return client;
};

export const sendSms = async ({ to, body }) => {
    const twilioClient = getClient();
    if (!twilioClient) {
        console.log(`[twilio:dry-run] SMS to ${to}: ${body}`);
        return { sid: "DRY-RUN", dryRun: true };
    }

    const message = await twilioClient.messages.create({
        to,
        from: process.env.TWILIO_PHONE_NUMBER,
        body
    });

    return { sid: message.sid, status: message.status, dryRun: false };
};

const escapeXml = (value = "") =>
    String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");

const formatInterviewTime = (dateTime) => {
    if (!dateTime) return "the interview slot shared by the recruiter";
    const date = new Date(dateTime);
    if (Number.isNaN(date.getTime())) return "the interview slot shared by the recruiter";
    return date.toLocaleString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZone: "Asia/Kolkata"
    }) + " IST";
};

export const buildCandidateCallTwiml = ({ candidateName, jobTitle, company, interviewDateTime, hrName, hrPhone }) => {
    const when = formatInterviewTime(interviewDateTime);
    const speech = `Hello ${escapeXml(candidateName)}. This is an automated call from GetJob. Congratulations, you have been shortlisted for the role of ${escapeXml(jobTitle)} at ${escapeXml(company)}. Your interview is scheduled on ${escapeXml(when)}. Please reply to this message or contact ${escapeXml(hrName || "the recruiter")} at ${escapeXml(hrPhone || "the company")} to confirm your attendance. Thank you.`;

    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Joanna" language="en-IN">${speech}</Say>
    <Pause length="1"/>
    <Gather numDigits="1" action="/api/hiring/twilio/candidate-gather" method="POST">
        <Say voice="Polly.Joanna" language="en-IN">Press 1 to confirm, or press 2 to reschedule.</Say>
    </Gather>
    <Say voice="Polly.Joanna" language="en-IN">We did not receive any input. Goodbye.</Say>
</Response>`;
};

export const callCandidate = async ({ to, ...message }) => {
    const twilioClient = getClient();
    const twiml = buildCandidateCallTwiml(message);

    if (!twilioClient) {
        console.log(`[twilio:dry-run] Voice call to ${to}: ${message.candidateName} / ${message.jobTitle}`);
        return { sid: "DRY-RUN", status: "dry-run", dryRun: true };
    }

    const call = await twilioClient.calls.create({
        to,
        from: process.env.TWILIO_PHONE_NUMBER,
        twiml,
        statusCallback: `${process.env.SERVER_URL || "http://localhost:8000"}/api/hiring/twilio/call-status`,
        statusCallbackEvent: ["initiated", "ringing", "answered", "completed"]
    });

    return { sid: call.sid, status: call.status, dryRun: false };
};

export const validateTwilioSignature = (req) => {
    if (!process.env.TWILIO_AUTH_TOKEN) return true;
    const signature = req.headers["x-twilio-signature"];
    if (!signature) return false;
    const url = `${process.env.SERVER_URL || `http://${req.headers.host}`}${req.originalUrl}`;
    return twilio.validateRequest(process.env.TWILIO_AUTH_TOKEN, signature, url, req.body || {});
};

export default { sendSms, callCandidate, isTwilioConfigured, validateTwilioSignature };
