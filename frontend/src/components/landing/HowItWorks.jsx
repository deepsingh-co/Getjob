import React from 'react'
import { motion } from 'motion/react'

const steps = [
    {
        n: "01",
        title: "Build your profile",
        text: "Add skills, experience and a phone number so the system can match and reach you."
    },
    {
        n: "02",
        title: "Practise with AI",
        text: "Run mock interviews and scan your resume until your score stops dipping."
    },
    {
        n: "03",
        title: "Get called for interviews",
        text: "Recruiters are texted your profile. The moment they confirm, your phone rings."
    }
]

function HowItWorks() {
    return (
        <section className="relative bg-gray-900 text-white py-24 overflow-hidden">
            <div className="absolute -top-24 right-0 w-[380px] h-[380px] rounded-full bg-indigo-600/20 blur-3xl animate-blob" />
            <div className="absolute bottom-0 left-0 w-[320px] h-[320px] rounded-full bg-sky-500/10 blur-3xl animate-blob" style={{ animationDelay: "-8s" }} />

            <div className="relative mx-auto max-w-7xl px-6">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.7 }}
                    className="max-w-2xl"
                >
                    <p className="text-[11px] uppercase tracking-[0.3em] text-indigo-400">How it works</p>
                    <h2 className="mt-3 text-3xl md:text-5xl font-semibold tracking-tight">
                        Three steps between you and the offer
                    </h2>
                </motion.div>

                <div className="relative mt-16">
                    <svg className="absolute inset-x-0 top-12 hidden md:block" width="100%" height="60" viewBox="0 0 1000 60" fill="none" preserveAspectRatio="none">
                        <motion.path
                            d="M80 30 C 300 -10, 400 70, 500 30 S 750 -10, 920 30"
                            stroke="url(#lineGrad)"
                            strokeWidth="2"
                            strokeDasharray="6 8"
                            strokeLinecap="round"
                            initial={{ pathLength: 0, opacity: 0 }}
                            whileInView={{ pathLength: 1, opacity: 1 }}
                            viewport={{ once: true, amount: 0.6 }}
                            transition={{ duration: 1.6, ease: "easeInOut" }}
                        />
                        <defs>
                            <linearGradient id="lineGrad" x1="0" y1="0" x2="1000" y2="0" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#6366f1" />
                                <stop offset="1" stopColor="#0ea5e9" />
                            </linearGradient>
                        </defs>
                    </svg>

                    <div className="grid md:grid-cols-3 gap-8">
                        {steps.map((s, i) => (
                            <motion.div
                                key={s.n}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.4 }}
                                transition={{ duration: 0.7, delay: i * 0.18 }}
                                whileHover={{ y: -10 }}
                                className="relative rounded-3xl bg-white/5 border border-white/10 p-7 backdrop-blur-sm"
                            >
                                <span className="text-5xl font-semibold text-white/10">{s.n}</span>
                                <h3 className="mt-3 text-xl font-semibold">{s.title}</h3>
                                <p className="mt-3 text-sm text-white/60 leading-relaxed">{s.text}</p>
                                <motion.span
                                    className="absolute -top-3 left-7 h-6 w-6 rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/40"
                                    initial={{ scale: 0 }}
                                    whileInView={{ scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2 + i * 0.18, type: "spring", stiffness: 300 }}
                                />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default HowItWorks
