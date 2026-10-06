import React from 'react'
import Navbar from '../components/Navbar.jsx'
import CtaFooter from '../components/landing/CtaFooter.jsx'
import { motion } from 'motion/react'

const sections = [
    {
        title: "Information we collect",
        body: [
            "Account data: your name and email address, obtained from Google Sign-In when you create an account.",
            "Candidate profile data: skills, experience, education, location, headline and the phone number used for interview confirmation calls.",
            "Company data: company name, website, description, job postings and the work items you upload (including cover images).",
            "Usage data: pages visited, actions taken and basic logs needed to keep the service secure."
        ]
    },
    {
        title: "How we use your information",
        body: [
            "To match candidate profiles against job postings using skills, experience, education and location.",
            "To send SMS notifications to company recruiters about matched candidates, and to place automated voice calls to candidates confirming an interview slot — only after the recruiter confirms.",
            "To provide AI mock interviews, resume analysis and score history.",
            "To respond to messages you send us through the contact form."
        ]
    },
    {
        title: "Messaging and calling (Twilio)",
        body: [
            "We use Twilio as a processor to deliver SMS and voice calls. The content sent is the shortlist summary for recruiters and the interview confirmation for candidates.",
            "Phone numbers are never published. Recruiters only see candidates matched to their role, and candidates only receive calls for roles they matched.",
            "Call and SMS delivery status is stored to audit the scheduling flow."
        ]
    },
    {
        title: "Cookies and sessions",
        body: [
            "We use a single httpOnly session cookie containing a signed JWT to keep you logged in for up to 7 days.",
            "We do not use third-party advertising or tracking cookies."
        ]
    },
    {
        title: "Sharing and retention",
        body: [
            "Profile details are shared with a recruiter only when your profile matches a role they posted and they confirm interest.",
            "We do not sell your personal data.",
            "We keep account and profile data until you delete your account; contact form messages are kept for up to 12 months."
        ]
    },
    {
        title: "Your rights",
        body: [
            "You can review and update your profile at any time from your dashboard.",
            "You can request deletion of your account and associated data by writing to us.",
            "Opting out is simple: set your profile to not open to work, and you will not be matched or contacted."
        ]
    },
    {
        title: "Contact",
        body: [
            "Questions about this policy: support@interviewhai.com. We reply within 1 business day."
        ]
    }
]

function Privacy() {
    return (
        <div className="min-h-screen bg-[#f3f3f3] flex flex-col">
            <Navbar />

            <main className="flex-1 mx-auto w-full max-w-4xl px-6 pt-16 pb-20">
                <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                    <p className="text-[11px] uppercase tracking-[0.3em] text-indigo-600">Legal</p>
                    <h1 className="mt-3 text-3xl md:text-5xl font-semibold tracking-tight text-gray-900">Privacy Policy</h1>
                    <p className="mt-4 text-sm text-gray-500">Last updated: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
                    <p className="mt-4 text-gray-600 leading-relaxed">
                        This policy explains what Interview.Hai collects, why we collect it, and the choices you have.
                        By using the service you agree to the practices described below.
                    </p>
                </motion.div>

                <div className="mt-10 flex flex-col gap-5">
                    {sections.map((s, i) => (
                        <motion.section
                            key={s.title}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ duration: 0.55, delay: Math.min(i * 0.05, 0.2) }}
                            className="rounded-[24px] bg-white border border-gray-200 p-6 md:p-8 shadow-sm"
                        >
                            <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                                <span className="text-gray-300 mr-2">{String(i + 1).padStart(2, "0")}</span>
                                {s.title}
                            </h2>
                            <ul className="mt-4 flex flex-col gap-3">
                                {s.body.map((line) => (
                                    <li key={line} className="text-sm md:text-base text-gray-600 leading-relaxed pl-4 relative">
                                        <span className="absolute left-0 top-2 h-1.5 w-1.5 rounded-full bg-indigo-500" />
                                        {line}
                                    </li>
                                ))}
                            </ul>
                        </motion.section>
                    ))}
                </div>
            </main>

            <CtaFooter />
        </div>
    )
}

export default Privacy
