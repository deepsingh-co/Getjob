import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'motion/react'
import { FaRobot, FaPaperPlane, FaTimes, FaComments, FaUser } from 'react-icons/fa'
import { ServerUrl } from '../App'

const defaultSuggestions = [
    "How does matching work?",
    "How do I post a job?",
    "What is Manual Approve?",
    "How do the automated calls work?",
    "Contact support"
]

let nextId = 1
const makeMessage = (role, text) => ({ id: nextId++, role, text, at: new Date() })

function Chatbot() {
    const [open, setOpen] = useState(false)
    const [messages, setMessages] = useState([
        {
            id: nextId++,
            role: "bot",
            text: "Hi! I'm Hai, your Interview.Hai assistant. Ask me about matching, job posting, Manual Approve, or how the automated calls work.",
            at: new Date()
        }
    ])
    const [suggestions, setSuggestions] = useState(defaultSuggestions)
    const [input, setInput] = useState("")
    const [typing, setTyping] = useState(false)
    const scrollRef = useRef(null)
    const inputRef = useRef(null)

    useEffect(() => {
        if (!open) return
        axios.get(ServerUrl + "/api/chatbot/suggestions")
            .then(({ data }) => {
                if (Array.isArray(data?.suggestions) && data.suggestions.length) {
                    setSuggestions(data.suggestions)
                }
            })
            .catch(() => { })
        setTimeout(() => inputRef.current?.focus(), 250)
    }, [open])

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, typing, open])

    const send = async (raw) => {
        const text = String(raw ?? input).trim()
        if (!text || typing) return

        setMessages((prev) => [...prev, makeMessage("user", text)])
        setInput("")
        setTyping(true)

        try {
            const { data } = await axios.post(ServerUrl + "/api/chatbot/chat", { message: text })
            const reply = data?.reply || "Sorry, I couldn't process that. Try asking about matching or Manual Approve."
            setTimeout(() => {
                setMessages((prev) => [...prev, makeMessage("bot", reply)])
                setTyping(false)
            }, 350)
        } catch {
            setTimeout(() => {
                setMessages((prev) => [
                    ...prev,
                    makeMessage("bot", "The assistant is unreachable right now. Please try again or use the Contact page.")
                ])
                setTyping(false)
            }, 350)
        }
    }

    const onKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            send()
        }
    }

    const showSuggestions = messages.length <= 1 && !typing

    return (
        <>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 24, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 24, scale: 0.96 }}
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                        className="fixed bottom-24 right-4 sm:right-6 z-[60] w-[calc(100vw-2rem)] sm:w-[380px] h-[min(560px,calc(100vh-7rem))] bg-white rounded-[28px] border border-gray-200 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.35)] flex flex-col overflow-hidden"
                    >
                        <header className="flex items-center gap-3 px-5 py-4 bg-gray-900 text-white">
                            <span className="grid place-items-center w-9 h-9 rounded-2xl bg-indigo-500 text-white">
                                <FaRobot />
                            </span>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold leading-tight">Hai Assistant</p>
                                <p className="text-[11px] text-white/60">Online · replies instantly</p>
                            </div>
                            <button
                                onClick={() => setOpen(false)}
                                aria-label="Close chat"
                                className="grid place-items-center w-8 h-8 rounded-full hover:bg-white/10 transition-colors"
                            >
                                <FaTimes />
                            </button>
                        </header>

                        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 bg-[#f8f8f8]">
                            <div className="flex flex-col gap-3">
                                {messages.map((m) => (
                                    <motion.div
                                        key={m.id}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex items-end gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                                    >
                                        {m.role === "bot" && (
                                            <span className="grid place-items-center w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 shrink-0">
                                                <FaRobot className="text-xs" />
                                            </span>
                                        )}
                                        <div
                                            className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${m.role === "user"
                                                ? "bg-gray-900 text-white rounded-br-md"
                                                : "bg-white text-gray-700 border border-gray-200 rounded-bl-md"
                                                }`}
                                        >
                                            {m.text}
                                        </div>
                                        {m.role === "user" && (
                                            <span className="grid place-items-center w-7 h-7 rounded-full bg-gray-200 text-gray-600 shrink-0">
                                                <FaUser className="text-xs" />
                                            </span>
                                        )}
                                    </motion.div>
                                ))}

                                {typing && (
                                    <div className="flex items-end gap-2 justify-start">
                                        <span className="grid place-items-center w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 shrink-0">
                                            <FaRobot className="text-xs" />
                                        </span>
                                        <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
                                            {[0, 1, 2].map((i) => (
                                                <motion.span
                                                    key={i}
                                                    animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                                                    transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
                                                    className="w-1.5 h-1.5 rounded-full bg-indigo-500"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {showSuggestions && (
                                    <div className="mt-1 flex flex-wrap gap-2">
                                        {suggestions.map((s) => (
                                            <button
                                                key={s}
                                                onClick={() => send(s)}
                                                className="text-xs px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-600 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="border-t border-gray-200 bg-white p-3">
                            <div className="flex items-end gap-2">
                                <textarea
                                    ref={inputRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={onKeyDown}
                                    rows={1}
                                    placeholder="Ask about matching, jobs, interviews..."
                                    className="flex-1 resize-none max-h-28 px-4 py-2.5 rounded-2xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.94 }}
                                    onClick={() => send()}
                                    disabled={!input.trim() || typing}
                                    aria-label="Send message"
                                    className="grid place-items-center w-10 h-10 rounded-full bg-gray-900 text-white disabled:opacity-40 shrink-0"
                                >
                                    <FaPaperPlane className="text-sm" />
                                </motion.button>
                            </div>
                            <p className="mt-2 text-center text-[10px] text-gray-400">
                                Automated assistant · for urgent issues use the Contact page
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                onClick={() => setOpen((v) => !v)}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                aria-label={open ? "Close chat" : "Open chat"}
                className="fixed bottom-6 right-4 sm:right-6 z-[60] grid place-items-center w-14 h-14 rounded-full bg-gray-900 text-white shadow-[0_18px_40px_-12px_rgba(0,0,0,0.5)]"
            >
                <AnimatePresence mode="wait" initial={false}>
                    {open ? (
                        <motion.span
                            key="close"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.18 }}
                        >
                            <FaTimes />
                        </motion.span>
                    ) : (
                        <motion.span
                            key="open"
                            initial={{ rotate: 90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: -90, opacity: 0 }}
                            transition={{ duration: 0.18 }}
                        >
                            <FaComments />
                        </motion.span>
                    )}
                </AnimatePresence>
                {!open && (
                    <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-indigo-500 border-2 border-white" />
                )}
            </motion.button>
        </>
    )
}

export default Chatbot