import React, { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { FaArrowRight, FaPlay } from 'react-icons/fa'
import { HiSparkles } from 'react-icons/hi'
import axios from 'axios'
import { ServerUrl } from '../../App'
import heroShot from '../../assets/MM.png'
import resumeShot from '../../assets/resume.png'
import hrShot from '../../assets/HR.png'

const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } }
}

const word = {
    hidden: { opacity: 0, y: 32, filter: "blur(8px)" },
    visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
}

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
}

function FloatCard({ className, delay = 0, rotate = 0, src, label, sub }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
            className={`absolute ${className}`}
        >
            <motion.div
                animate={{ y: [0, -16, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: delay * 4 }}
                style={{ rotate }}
                className="bg-white rounded-2xl shadow-[0_18px_50px_-18px_rgba(0,0,0,0.35)] border border-gray-100 overflow-hidden"
            >
                <img src={src} alt={label} className="w-full h-full object-cover" />
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-white via-white/90 to-transparent">
                    <p className="text-xs font-semibold text-gray-900">{label}</p>
                    <p className="text-[10px] text-gray-500">{sub}</p>
                </div>
            </motion.div>
        </motion.div>
    )
}

function Hero() {
    const title = "Crack the interview. Land the offer."
    const [stats, setStats] = useState(null)

    useEffect(() => {
        axios.get(ServerUrl + "/api/stats")
            .then((res) => setStats(res.data))
            .catch(() => setStats({ candidates: 0, jobs: 0, confirmed: 0 }))
    }, [])

    const heroStats = [
        { value: stats ? stats.candidates.toLocaleString("en-IN") : "—", label: "candidates on board" },
        { value: stats ? stats.jobs.toLocaleString("en-IN") : "—", label: "jobs posted" },
        { value: stats ? stats.confirmed.toLocaleString("en-IN") : "—", label: "interviews confirmed" }
    ]

    return (
        <section className="relative overflow-hidden">
            <div className="absolute -top-32 -left-24 w-[420px] h-[420px] rounded-full bg-indigo-300/40 blur-3xl animate-blob" />
            <div className="absolute top-24 -right-24 w-[380px] h-[380px] rounded-full bg-sky-300/40 blur-3xl animate-blob" style={{ animationDelay: "-6s" }} />
            <div className="absolute bottom-0 left-1/3 w-[320px] h-[320px] rounded-full bg-fuchsia-200/50 blur-3xl animate-blob" style={{ animationDelay: "-11s" }} />

            <div className="relative mx-auto max-w-7xl px-6 pt-20 pb-24 lg:pt-28 lg:pb-32 grid lg:grid-cols-2 gap-14 items-center">
                <div>
                    <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        className="inline-flex items-center gap-2 rounded-full bg-white border border-gray-200 px-4 py-1.5 text-xs font-medium text-gray-600 shadow-sm"
                    >
                        <span className="text-indigo-600"><HiSparkles /></span>
                        AI mock interviews + instant HR matching
                    </motion.div>

                    <motion.h1
                        variants={container}
                        initial="hidden"
                        animate="visible"
                        className="mt-6 text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05] text-gray-900"
                    >
                        {title.split(" ").map((w, i) => (
                            <motion.span key={i} variants={word} className="inline-block mr-3">
                                {i === title.split(" ").length - 2 ? (
                                    <span className="text-gradient animate-gradient">{w}</span>
                                ) : w}
                            </motion.span>
                        ))}
                    </motion.h1>

                    <motion.p
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.5 }}
                        className="mt-6 text-base md:text-lg text-gray-600 max-w-xl leading-relaxed"
                    >
                        Practice with an AI interviewer, scan your resume, and get matched with recruiters who call you back — automatically.
                    </motion.p>

                    <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.65 }}
                        className="mt-9 flex flex-wrap items-center gap-4"
                    >
                        <motion.span
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.97 }}
                            className="inline-block"
                        >
                            <Link
                                to="/auth"
                                className="group inline-flex items-center gap-2 rounded-full bg-black text-white px-7 py-3.5 text-sm font-medium shadow-lg shadow-black/20"
                            >
                                Start practising free
                                <FaArrowRight className="transition-transform group-hover:translate-x-1" />
                            </Link>
                        </motion.span>

                        <motion.button
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.97 }}
                            className="inline-flex items-center gap-2 rounded-full bg-white border border-gray-200 px-7 py-3.5 text-sm font-medium text-gray-800 shadow-sm"
                        >
                            <span className="grid place-items-center w-6 h-6 rounded-full bg-gray-100 text-xs"><FaPlay /></span>
                            Watch how it works
                        </motion.button>
                    </motion.div>

                    <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.8 }}
                        className="mt-10 flex items-center gap-6 text-xs text-gray-500"
                    >
                        {heroStats.map((s, i) => (
                            <React.Fragment key={s.label}>
                                {i > 0 && <div className="w-px h-8 bg-gray-200" />}
                                <div>
                                    <p className="text-xl font-semibold text-gray-900">{s.value}</p>
                                    <p>{s.label}</p>
                                </div>
                            </React.Fragment>
                        ))}
                    </motion.div>
                </div>

                <div className="relative h-[440px] sm:h-[520px] hidden md:block">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, rotate: -4 }}
                        animate={{ opacity: 1, scale: 1, rotate: -4 }}
                        transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute inset-x-8 top-6 rounded-[28px] overflow-hidden shadow-[0_40px_80px_-30px_rgba(0,0,0,0.45)] border border-white/70 bg-white"
                    >
                        <img src={heroShot} alt="Interview.Hai dashboard" className="w-full h-[380px] object-cover object-top" />
                    </motion.div>

                    <FloatCard
                        src={resumeShot}
                        label="Resume scored"
                        sub="ATS match 87%"
                        className="w-44 -left-4 bottom-16"
                        delay={0.7}
                        rotate={-8}
                    />
                    <FloatCard
                        src={hrShot}
                        label="HR notified"
                        sub="Twilio SMS sent"
                        className="w-40 right-0 bottom-4"
                        delay={0.9}
                        rotate={7}
                    />

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.1, duration: 0.6 }}
                        className="absolute right-2 top-4 rounded-2xl bg-black text-white px-4 py-3 text-xs shadow-xl"
                    >
                        <p className="font-semibold">Incoming call</p>
                        <p className="text-white/60">Interview confirmed for Fri, 10:30 AM</p>
                    </motion.div>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4 }}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-gray-400"
            >
                scroll
                <span className="block w-px h-8 bg-gray-300 relative overflow-hidden">
                    <span className="absolute top-0 left-0 w-px h-3 bg-gray-900 animate-scroll-dot" />
                </span>
            </motion.div>
        </section>
    )
}

export default Hero
