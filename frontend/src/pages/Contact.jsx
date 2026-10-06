import React, { useState } from 'react'
import Navbar from '../components/Navbar.jsx'
import CtaFooter from '../components/landing/CtaFooter.jsx'
import { motion } from 'motion/react'
import axios from 'axios'
import { ServerUrl } from '../App'
import { FaEnvelope, FaMapMarkerAlt, FaSpinner, FaPaperPlane } from 'react-icons/fa'

function Contact() {
    const [form, setForm] = useState({ name: "", email: "", message: "" })
    const [sending, setSending] = useState(false)
    const [status, setStatus] = useState({ type: "", text: "" })

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

    const submit = async (e) => {
        e.preventDefault()
        setSending(true)
        setStatus({ type: "", text: "" })
        try {
            await axios.post(ServerUrl + "/api/contact", form)
            setStatus({ type: "success", text: "Thanks! Your message has been received — we reply within 1 business day." })
            setForm({ name: "", email: "", message: "" })
        } catch (err) {
            setStatus({ type: "error", text: err.response?.data?.message || "Could not send the message. Please try again." })
        } finally {
            setSending(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#f3f3f3] flex flex-col">
            <Navbar />

            <main className="flex-1 mx-auto w-full max-w-6xl px-6 pt-16 pb-20">
                <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                    <p className="text-[11px] uppercase tracking-[0.3em] text-indigo-600">Contact</p>
                    <h1 className="mt-3 text-3xl md:text-5xl font-semibold tracking-tight text-gray-900">
                        Talk to the team
                    </h1>
                    <p className="mt-4 text-gray-600 max-w-xl">
                        Hiring questions, partnerships, press or a bug — send it here and a human will get back to you.
                    </p>
                </motion.div>

                <div className="mt-10 grid lg:grid-cols-[1fr_1.2fr] gap-6 items-start">
                    <motion.div
                        initial={{ opacity: 0, y: 26 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.6 }}
                        className="rounded-[28px] bg-white border border-gray-200 p-6 shadow-sm flex flex-col gap-4"
                    >
                        <div className="flex items-start gap-3">
                            <span className="grid place-items-center w-10 h-10 rounded-xl bg-gray-900 text-white"><FaEnvelope /></span>
                            <div>
                                <p className="text-sm font-medium text-gray-900">Email</p>
                                <a href="mailto:support@interviewhai.com" className="text-sm text-gray-600 underline underline-offset-4">support@interviewhai.com</a>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <span className="grid place-items-center w-10 h-10 rounded-xl bg-gray-900 text-white"><FaMapMarkerAlt /></span>
                            <div>
                                <p className="text-sm font-medium text-gray-900">Office</p>
                                <p className="text-sm text-gray-600">Bengaluru, India</p>
                            </div>
                        </div>

                        <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                            <p className="text-sm font-medium text-gray-900">Companies</p>
                            <p className="text-sm text-gray-600 mt-1">
                                For posting roles and sourcing matched candidates, use the company &amp; founder login from the home page.
                            </p>
                        </div>
                    </motion.div>

                    <motion.form
                        onSubmit={submit}
                        initial={{ opacity: 0, y: 26 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.18, duration: 0.6 }}
                        className="rounded-[28px] bg-white border border-gray-200 p-6 md:p-8 shadow-sm"
                    >
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">Name</label>
                                <input
                                    name="name"
                                    required
                                    value={form.name}
                                    onChange={handleChange}
                                    className="w-full mt-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Email</label>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    value={form.email}
                                    onChange={handleChange}
                                    className="w-full mt-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                                />
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="text-sm font-medium">Message</label>
                            <textarea
                                name="message"
                                rows="5"
                                required
                                value={form.message}
                                onChange={handleChange}
                                className="w-full mt-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                            />
                        </div>

                        {status.text && (
                            <p className={`mt-4 text-sm rounded-xl px-4 py-3 border ${status.type === "success"
                                ? "text-green-700 bg-green-50 border-green-100"
                                : "text-red-600 bg-red-50 border-red-100"}`}>
                                {status.text}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={sending}
                            className="mt-6 w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-black text-white px-7 py-3 text-sm font-medium disabled:opacity-60"
                        >
                            {sending ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
                            {sending ? "Sending..." : "Send message"}
                        </button>
                    </motion.form>
                </div>
            </main>

            <CtaFooter />
        </div>
    )
}

export default Contact
