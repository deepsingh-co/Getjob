const SYSTEM_PROMPT = `You are "Hai", the friendly assistant for Interview.Hai (also called GetJob), an AI-assisted hiring platform.

How the platform works:
- Candidates sign in with Google, build a profile (skills, phone, experience, education, location) and get matched to open jobs via skill-based scoring.
- Companies post jobs. The system immediately matches candidates and scores them.
- The recruiter receives an SMS shortlist plus an automated Twilio voice call with a keypad menu: 1 confirm, 2 human review, 3 cancel, 4 follow up.
- On confirmation, the candidate gets an automated call and SMS with the interview details.
- Recruiters can also open the Company Dashboard and use "Manual Approve" to confirm an interview and set the meeting date/time without a call.
- Interview statuses: matched, hr_notified, hr_confirmed, candidate_called, human_review, follow_up, delayed, next_job, rejected, failed.
- Candidates start with free credits for AI practice.

Answer briefly and helpfully (max 3 sentences). If asked something unrelated to the platform, politely steer back to Interview.Hai topics.`;

const intents = [
    {
        name: "greeting",
        keywords: ["hi", "hello", "hey", "namaste", "good morning", "good evening", "hola"],
        reply: "Hi! I'm Hai, your Interview.Hai assistant. Ask me about matching, job posting, Manual Approve, interview statuses, or how the automated calls work."
    },
    {
        name: "matching",
        keywords: ["match", "matching", "score", "algorithm", "how do candidates", "skills match", "shortlist"],
        reply: "When a company posts a job, we score every open candidate on skill overlap, experience, education and location. The best matches appear on the company dashboard and are sent to the recruiter by SMS. Candidates see their match percentage on their dashboard."
    },
    {
        name: "post_job",
        keywords: ["post a job", "post job", "create job", "job posting", "hire", "recruiter", "company account", "posting"],
        reply: "Sign in as a company (Company & founder login), open your Company Dashboard and click \"Post a job\". Enter the role, required skills, experience, location and interview date — matching starts automatically."
    },
    {
        name: "manual_approve",
        keywords: ["manual approve", "manual", "approve", "schedule meeting", "meeting", "confirm without call", "self confirm"],
        reply: "In the Company Dashboard under Matched candidates, click \"Manual Approve\" on a candidate. Pick a meeting date/time and press \"Approve & Notify\" — the interview is confirmed instantly and the candidate receives an SMS, no call needed."
    },
    {
        name: "call_flow",
        keywords: ["call", "twilio", "ivr", "voice", "phone call", "keypad", "sms", "automated call"],
        reply: "Recruiters get an SMS shortlist plus an automated Twilio call — press 1 to confirm, 2 for human review, 3 to cancel, 4 for follow up. After confirmation, selected candidates receive a call and SMS with their interview details."
    },
    {
        name: "statuses",
        keywords: ["status", "pipeline", "hr_notified", "hr_confirmed", "candidate_called", "matched", "delayed", "rejected", "next_job", "follow up", "human review"],
        reply: "Interview stages: matched → hr_notified → hr_confirmed → candidate_called. Outcomes include delayed (candidate needs a new slot), next_job, human_review, follow_up, rejected and failed. You can track everything on your dashboard."
    },
    {
        name: "candidate_help",
        keywords: ["profile", "resume", "candidate", "skills", "apply", "signup", "sign up", "register", "credits"],
        reply: "Candidates sign in with Google, complete their profile (skills, phone, experience, location) and set \"Open to work\". You'll then be matched to jobs and can track interviews plus your live interview sessions on the dashboard."
    },
    {
        name: "interview_practice",
        keywords: ["mock", "practice", "ai interview", "prepare", "question", "learning", "resources"],
        reply: "Our AI mock interview practice and learning resources are on the Roadmap page — role-specific questions, resume checks and scoring guides. Head to /roadmap to explore."
    },
    {
        name: "contact",
        keywords: ["contact", "support", "help", "email", "reach", "bug", "issue", "problem"],
        reply: "You can reach the team through the Contact page (/contact) or email support@interviewhai.com. We usually reply within 1 business day."
    },
    {
        name: "privacy",
        keywords: ["privacy", "data", "cookie", "delete account", "gdpr", "safe", "security"],
        reply: "We only collect what's needed to match and contact you. Phone numbers are never published, we use one httpOnly session cookie, and we never sell your data. Full details are on the Privacy page."
    },
    {
        name: "thanks",
        keywords: ["thanks", "thank you", "great", "awesome", "cool", "nice", "bye", "goodbye"],
        reply: "Happy to help! Reach out anytime — and good luck with your interviews."
    }
];

const normalize = (text) =>
    String(text || "")
        .toLowerCase()
        .replace(/[^\w\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

const matchIntent = (message) => {
    const text = normalize(message);
    if (!text) return null;

    let best = null;
    let bestScore = 0;

    for (const intent of intents) {
        let score = 0;
        for (const keyword of intent.keywords) {
            const k = normalize(keyword);
            if (!k) continue;
            if (text === k) score += 4;
            else if (text.includes(k)) score += k.includes(" ") ? 3 : 2;
        }
        if (score > bestScore) {
            bestScore = score;
            best = intent;
        }
    }

    return bestScore > 0 ? best : null;
};

const fallbackReply =
    "I'm not sure about that one yet. Try asking: \"How does matching work?\", \"How do I post a job?\", \"What is Manual Approve?\", \"How do the automated calls work?\", or \"Contact support\".";

const askOpenAi = async (message) => {
    const key = process.env.OPENAI_API_KEY;
    if (!key) return null;

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${key}`
            },
            body: JSON.stringify({
                model: process.env.OPENAI_MODEL || "gpt-4o-mini",
                messages: [
                    { role: "system", content: SYSTEM_PROMPT },
                    { role: "user", content: String(message).slice(0, 800) }
                ],
                max_tokens: 160,
                temperature: 0.4
            })
        });

        if (!response.ok) return null;
        const data = await response.json();
        const reply = data?.choices?.[0]?.message?.content?.trim();
        return reply || null;
    } catch (error) {
        console.error("OpenAI chatbot failed:", error.message);
        return null;
    }
};

export const chat = async (req, res) => {
    try {
        const message = String(req.body?.message || "").trim();
        if (!message) {
            return res.status(400).json({ message: "Message is required" });
        }

        const aiReply = await askOpenAi(message);
        if (aiReply) {
            return res.status(200).json({ reply: aiReply, source: "ai" });
        }

        const intent = matchIntent(message);
        return res.status(200).json({
            reply: intent ? intent.reply : fallbackReply,
            source: "rules",
            intent: intent?.name || "fallback"
        });
    } catch (error) {
        return res.status(500).json({ message: `Chatbot failed: ${error.message}` });
    }
};

export const suggestions = async (req, res) => {
    return res.status(200).json({
        suggestions: [
            "How does matching work?",
            "How do I post a job?",
            "What is Manual Approve?",
            "How do the automated calls work?",
            "What are the interview statuses?",
            "Contact support"
        ]
    });
};