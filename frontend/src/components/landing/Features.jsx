import React from 'react'
import { motion } from 'motion/react'
import { FaRobot, FaFileAlt, FaPhoneAlt, FaChartLine, FaHistory, FaCoins } from 'react-icons/fa'
import aiShot from '../../assets/ai-ans.png'
import pdfShot from '../../assets/pdf.png'
import confiShot from '../../assets/confi.png'
import techShot from '../../assets/tech.png'

const reveal = {
    hidden: { opacity: 0, y: 36 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
}

const grid = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12 } }
}

const features = [
    {
        icon: FaRobot,
        title: "AI mock interviews",
        text: "Role-specific questions, real-time follow ups and an honest score after every round.",
        shot: aiShot,
        span: "md:col-span-2 md:row-span-2",
        tall: true
    },
    {
        icon: FaFileAlt,
        title: "Resume & PDF scan",
        text: "Instant ATS score with fixes you can copy paste.",
        shot: pdfShot,
        span: "md:col-span-1"
    },
    {
        icon: FaPhoneAlt,
        title: "HR gets pinged on Twilio",
        text: "Shortlisted candidates are texted to the recruiter automatically.",
        shot: techShot,
        span: "md:col-span-1"
    },
    {
        icon: FaChartLine,
        title: "Confidence analytics",
        text: "Track filler words, pace and clarity across attempts.",
        shot: confiShot,
        span: "md:col-span-1"
    },
    {
        icon: FaHistory,
        title: "Full answer history",
        text: "Replay every answer you gave and see how you improved.",
        span: "md:col-span-1",
        plain: true
    },
    {
        icon: FaCoins,
        title: "Credit based access",
        text: "Start with 100 free credits, top up only when you need more.",
        span: "md:col-span-1",
        plain: true
    }
]

function Features() {
    return (
        <section className="mx-auto max-w-7xl px-6 py-24">
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.4 }}
                variants={reveal}
                className="max-w-2xl"
            >
                <p className="text-[11px] uppercase tracking-[0.3em] text-indigo-600">Everything in one place</p>
                <h2 className="mt-3 text-3xl md:text-5xl font-semibold tracking-tight text-gray-900">
                    Built to get you <span className="text-gradient animate-gradient">interview ready</span>
                </h2>
                <p className="mt-4 text-gray-600">
                    From the first practice answer to the final HR call — the whole loop, automated.
                </p>
            </motion.div>

            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.15 }}
                variants={grid}
                className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-5"
            >
                {features.map((f) => {
                    const Icon = f.icon
                    return (
                        <motion.article
                            key={f.title}
                            variants={reveal}
                            whileHover={{ y: -8 }}
                            transition={{ type: "spring", stiffness: 260, damping: 22 }}
                            className={`${f.span} group relative overflow-hidden rounded-3xl bg-white border border-gray-200 p-6 shadow-[0_20px_50px_-35px_rgba(0,0,0,0.5)]`}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gray-900 text-white text-lg group-hover:rotate-12 transition-transform duration-300">
                                        <Icon />
                                    </span>
                                    <h3 className="mt-4 text-lg font-semibold text-gray-900">{f.title}</h3>
                                    <p className="mt-2 text-sm text-gray-600 leading-relaxed">{f.text}</p>
                                </div>
                            </div>

                            {f.shot && (
                                <motion.img
                                    src={f.shot}
                                    alt={f.title}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.7, delay: 0.2 }}
                                    whileHover={{ scale: 1.04 }}
                                    className={`mt-5 w-full rounded-2xl border border-gray-100 bg-gray-50 ${f.tall ? "h-[240px] object-cover object-top" : "h-36 object-cover object-top"}`}
                                />
                            )}

                            {!f.shot && (
                                <div className="mt-5 h-36 rounded-2xl bg-gradient-to-br from-gray-50 to-indigo-50 border border-gray-100 grid place-items-center text-gray-300 text-4xl">
                                    <Icon />
                                </div>
                            )}
                        </motion.article>
                    )
                })}
            </motion.div>
        </section>
    )
}

export default Features
