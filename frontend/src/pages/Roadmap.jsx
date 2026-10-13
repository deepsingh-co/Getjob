import React from 'react'
import Navbar from '../components/Navbar.jsx'
import CtaFooter from '../components/landing/CtaFooter.jsx'
import { motion } from 'motion/react'
import { FaChartBar, FaBookOpen, FaLightbulb, FaFlagCheckered } from 'react-icons/fa'

const fade = {
    hidden: { opacity: 0, y: 26 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
}

const grid = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }

const roadmap = [
    {
        id: 1,
        icon: FaChartBar,
        title: "AI Mock Interview Expansion",
        description: "Expand AI interview question bank with industry-specific scenarios and technical assessments for engineering, product, and business roles."
    },
    {
        id: 2,
        icon: FaBookOpen,
        title: "Learning Resources Hub",
        description: "Curated articles, video tutorials, and resume guides to help candidates prepare and companies optimize their hiring process."
    },
    {
        id: 3,
        icon: FaLightbulb,
        title: "Enhanced Matching Algorithm",
        description: "Improved skill matching with weighted categories, experience validation, and location-aware role recommendations."
    },
    {
        id: 4,
        icon: FaFlagCheckered,
        title: "Video Interview Integration",
        description: "Live video call integration with screen sharing, recording, and real-time feedback for confirmed interviews."
    }
]

function Roadmap() {
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
                        Roadmap
                    </motion.p>
                    <motion.h1
                        variants={fade}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.08 }}
                        className="mt-3 text-3xl md:text-5xl font-semibold tracking-tight text-gray-900 max-w-3xl"
                    >
                        Product Roadmap
                    </motion.h1>
                    <motion.p
                        variants={fade}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.16 }}
                        className="mt-5 text-gray-600 max-w-2xl leading-relaxed"
                    >
                        Track our progress as we build Interview.Hai into the fastest path from practice to offer.
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
                        {roadmap.map((r) => {
                            const Icon = r.icon
                            return (
                                <motion.article
                                    key={r.id}
                                    variants={fade}
                                    whileHover={{ y: -8 }}
                                    className="rounded-3xl bg-white border border-gray-200 p-6 shadow-[0_20px_50px_-40px_rgba(0,0,0,0.7)]"
                                >
                                    <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gray-900 text-white">
                                        <Icon />
                                    </span>
                                    <h2 className="mt-4 text-lg font-semibold text-gray-900">{r.title}</h2>
                                    <p className="mt-2 text-sm text-gray-600 leading-relaxed">{r.description}</p>
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
                        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">Learning Resources</h2>
                        <p className="mt-4 text-sm text-gray-500 mb-8">
                            Prepare smarter with our curated collection of resources for candidates and companies.
                        </p>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="rounded-2xl border border-gray-200 p-5">
                                <h3 className="text-xl font-semibold text-gray-900">AI Mock Interview Guides</h3>
                                <ul className="mt-4 space-y-3 text-sm text-gray-600">
                                    <li>Technical question databases by role</li>
                                    <li>Behavioral interview star technique</li>
                                    <li>Resume-to-interview question mapping</li>
                                </ul>
                            </div>
                            <div className="rounded-2xl border border-gray-200 p-5">
                                <h3 className="text-xl font-semibold text-gray-900">Resume & Profile Tips</h3>
                                <ul className="mt-4 space-y-3 text-sm text-gray-600">
                                    <li>Keyword optimization for ATS</li>
                                    <li>Highlighting skills and experience</li>
                                    <li>Education and certification display</li>
                                </ul>
                            </div>
                            <div className="rounded-2xl border border-gray-200 p-5">
                                <h3 className="text-xl font-semibold text-gray-900">Company Hiring Guide</h3>
                                <ul className="mt-4 space-y-3 text-sm text-gray-600">
                                    <li>Writing effective job descriptions</li>
                                    <li>Structured candidate scoring</li>
                                    <li>Automated outreach best practices</li>
                                </ul>
                            </div>
                        </div>
                    </motion.div>
                </section>
            </main>

            <CtaFooter />
        </div>
    )
}

export default Roadmap