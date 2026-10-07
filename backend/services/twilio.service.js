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
    const speech = `Hello ${escapeXml(candidateName)}. This is an automated call from GetJob. Congratulations, you have been shortlisted for the role of ${escapeXml(jobTitle)} at ${escapeXml(company)}. Your interview is scheduled on ${escapeXml(when)}. Please key in your response on the keypad. Thank you.`;

    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Joanna" language="en-IN">${speech}</Say>
    <Pause length="1"/>
    <Gather numDigits="1" action="/api/hiring/twilio/candidate-gather" method="POST">
        <Say voice="Polly.Joanna" language="en-IN">Press 1 to confirm. Press 2 if you cannot confirm. Press 3 to delay the interview. Press 4 to be considered for the next job.</Say>
    </Gather>
    <Say voice="Polly.Joanna" language="en-IN">We did not receive any input. Goodbye.</Say>
</Response>`;
};

export const buildHrCallTwiml = ({ jobTitle, company, candidateCount, jobId }) => {
    const speech = `Hello. This is an automated call from GetJob. ${candidateCount} matched candidate${candidateCount === 1 ? " is" : "s are"} shortlisted for the role of ${escapeXml(jobTitle)} at ${escapeXml(company)}. The shortlist has been sent to you by text message. Key in your decision now.`;

    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Joanna" language="en-IN">${speech}</Say>
    <Pause length="1"/>
    <Gather numDigits="1" action="/api/hiring/twilio/hr-gather?job=${escapeXml(String(jobId))}" method="POST">
        <Say voice="Polly.Joanna" language="en-IN">Press 1 to confirm the shortlist and schedule the candidates. Press 2 for human review. Press 3 to cancel the shortlist. Press 4 to schedule a follow up.</Say>
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

export const callHr = async ({ to, ...message }) => {
    const twilioClient = getClient();
    const twiml = buildHrCallTwiml(message);

    if (!twilioClient) {
        console.log(`[twilio:dry-run] HR call to ${to}: ${message.candidateCount} candidate(s) for ${message.jobTitle}`);
        return { sid: "DRY-RUN", status: "dry-run", dryRun: true };
    }

    const call = await twilioClient.calls.create({
        to,
        from: process.env.TWILIO_PHONE_NUMBER,
        twiml
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

export default { sendSms, callCandidate, callHr, isTwilioConfigured, validateTwilioSignature };
