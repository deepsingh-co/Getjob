import React from 'react'
import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { FaArrowRight } from 'react-icons/fa'

function CtaFooter() {
    return (
        <>
            <section className="mx-auto max-w-7xl px-6 pb-24">
                <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className="relative overflow-hidden rounded-[36px] bg-gray-900 text-white px-8 py-16 md:px-16 text-center"
                >
                    <div className="absolute -top-20 -left-16 w-72 h-72 rounded-full bg-indigo-600/30 blur-3xl animate-blob" />
                    <div className="absolute -bottom-24 -right-10 w-72 h-72 rounded-full bg-sky-500/20 blur-3xl animate-blob" style={{ animationDelay: "-7s" }} />

                    <div className="relative">
                        <motion.h2
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="text-3xl md:text-5xl font-semibold tracking-tight"
                        >
                            Your next interview is <span className="text-gradient animate-gradient">already waiting</span>
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="mt-4 text-white/60 max-w-xl mx-auto"
                        >
                            Practise for free, get matched with recruiters, and let the callbacks come to you.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="mt-9 flex flex-wrap justify-center gap-4"
                        >
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
                                <Link to="/auth" className="inline-flex items-center gap-2 rounded-full bg-white text-gray-900 px-7 py-3.5 text-sm font-medium">
                                    Get started free <FaArrowRight />
                                </Link>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
                                <Link to="/auth?role=company" className="inline-flex items-center gap-2 rounded-full border border-white/25 px-7 py-3.5 text-sm font-medium text-white hover:bg-white/10 transition-colors">
                                    Company &amp; founder login
                                </Link>
                            </motion.div>
                        </motion.div>
                    </div>
                </motion.div>
            </section>

            <footer className="border-t border-gray-200 bg-white">
                <div className="mx-auto max-w-7xl px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <span className="bg-black text-white p-2 rounded-lg h-8 w-8 grid place-items-center text-xs">IH</span>
                        <div>
                            <p className="text-sm font-semibold text-gray-900">Interview.Hai</p>
                            <p className="text-xs text-gray-500">Practice. Match. Get hired.</p>
                        </div>
                    </div>

                    <nav className="flex flex-wrap justify-center gap-6 text-xs text-gray-500">
                        <Link to="/auth" className="hover:text-gray-900 transition-colors">Candidates</Link>
                        <Link to="/post-job" className="hover:text-gray-900 transition-colors">Post a job</Link>
                        <Link to="/profile" className="hover:text-gray-900 transition-colors">Profile</Link>
                    </nav>

                    <p className="text-xs text-gray-400">© {new Date().getFullYear()} Interview.Hai</p>
                </div>
            </footer>
        </>
    )
}

export default CtaFooter
