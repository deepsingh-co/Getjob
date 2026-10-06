import React from 'react'
import Navbar from '../components/Navbar.jsx'
import CtaFooter from '../components/landing/CtaFooter.jsx'
import { motion } from 'motion/react'
import { FaBullseye, FaRobot, FaPhoneAlt, FaShieldAlt } from 'react-icons/fa'

const fade = {
    hidden: { opacity: 0, y: 26 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
}

const grid = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }

const pillars = [
    {
        icon: FaRobot,
        title: "Practice before it counts",
        text: "AI mock interviews and resume scans turn guesswork into a score you can actually improve."
    },
    {
        icon: FaBullseye,
        title: "Matching that is honest",
        text: "Every candidate is scored against a role — skills, experience, education and location — no black box résumé spam."
    },
    {
        icon: FaPhoneAlt,
        title: "We close the loop",
        text: "When a recruiter confirms, our system calls the candidate to lock the interview time. No email ping-pong."
    },
    {
        icon: FaShieldAlt,
        title: "Your data stays yours",
        text: "We only keep what is needed to match and reach you, and we never sell candidate data."
    }
]

function About() {
    return (
        <div className="min-h-screen bg-[#f3f3f3] flex flex-col">
            <Navbar />

            <main className="flex-1">
                <section className="mx-auto max-w-7xl px-6 pt-16 pb-10">
                    <motion.p
                        variants={fade}
                        initial="hidden"
                        animate="visible"
                        className="text-[11px] uppercase tracking-[0.3em] text-indigo-600"
                    >
                        About us
                    </motion.p>
                    <motion.h1
                        variants={fade}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.08 }}
                        className="mt-3 text-3xl md:text-5xl font-semibold tracking-tight text-gray-900 max-w-3xl"
                    >
                        We are building the shortest path between practice and an offer
                    </motion.h1>
                    <motion.p
                        variants={fade}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.16 }}
                        className="mt-5 text-gray-600 max-w-2xl leading-relaxed"
                    >
                        Interview.Hai helps candidates prepare with AI, helps companies post roles that reach the right people,
                        and automates the awkward back-and-forth of scheduling so interviews actually happen.
                    </motion.p>
                </section>

                <section className="mx-auto max-w-7xl px-6 pb-16">
                    <motion.div
                        variants={grid}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
                    >
                        {pillars.map((p) => {
                            const Icon = p.icon
                            return (
                                <motion.article
                                    key={p.title}
                                    variants={fade}
                                    whileHover={{ y: -8 }}
                                    className="rounded-3xl bg-white border border-gray-200 p-6 shadow-[0_20px_50px_-40px_rgba(0,0,0,0.7)]"
                                >
                                    <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gray-900 text-white">
                                        <Icon />
                                    </span>
                                    <h2 className="mt-4 text-lg font-semibold text-gray-900">{p.title}</h2>
                                    <p className="mt-2 text-sm text-gray-600 leading-relaxed">{p.text}</p>
                                </motion.article>
                            )
                        })}
                    </motion.div>
                </section>

                <section className="mx-auto max-w-7xl px-6 pb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 26 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.4 }}
                        transition={{ duration: 0.7 }}
                        className="rounded-[32px] bg-white border border-gray-200 p-8 md:p-12"
                    >
                        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">How the flow works</h2>
                        <ol className="mt-6 grid md:grid-cols-3 gap-6">
                            {[
                                ["01", "Candidates build a profile", "Skills, experience and a phone number — that is all the matcher needs."],
                                ["02", "Companies post a role", "The system scores every open profile and texts the shortlist to the company HR."],
                                ["03", "HR confirms, we call", "On confirmation an automated call tells the candidate the interview time."]
                            ].map(([n, title, text]) => (
                                <li key={n} className="rounded-2xl border border-gray-200 p-5">
                                    <span className="text-3xl font-semibold text-gray-200">{n}</span>
                                    <p className="mt-2 font-medium text-gray-900">{title}</p>
                                    <p className="mt-1.5 text-sm text-gray-600">{text}</p>
                                </li>
                            ))}
                        </ol>
                    </motion.div>
                </section>
            </main>

            <CtaFooter />
        </div>
    )
}

export default About
