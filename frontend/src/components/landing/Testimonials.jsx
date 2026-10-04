import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { FaQuoteLeft } from 'react-icons/fa'

const quotes = [
    {
        text: "The AI interviewer kept grilling me until my answers were crisp. Two weeks later I cleared the actual round at the same company.",
        name: "Ananya Rao",
        role: "SDE-1, Bangalore"
    },
    {
        text: "My resume score went from 52 to 89 with the suggested fixes. Recruiters started replying to applications that were previously ignored.",
        name: "Kabir Mehta",
        role: "Product Analyst, Pune"
    },
    {
        text: "Got a Twilio call confirming the interview slot while I was on a train. Everything was scheduled without a single back-and-forth email.",
        name: "Sneha Iyer",
        role: "UX Designer, Chennai"
    }
]

function Testimonials() {
    const [index, setIndex] = useState(0)

    useEffect(() => {
        const id = setInterval(() => setIndex((i) => (i + 1) % quotes.length), 5000)
        return () => clearInterval(id)
    }, [])

    const current = quotes[index]

    return (
        <section className="mx-auto max-w-7xl px-6 py-24">
            <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12 items-center">
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.7 }}
                >
                    <p className="text-[11px] uppercase tracking-[0.3em] text-indigo-600">Loved by candidates</p>
                    <h2 className="mt-3 text-3xl md:text-5xl font-semibold tracking-tight text-gray-900">
                        Real people, real callbacks
                    </h2>
                    <div className="mt-6 flex gap-2">
                        {quotes.map((q, i) => (
                            <button
                                key={q.name}
                                onClick={() => setIndex(i)}
                                aria-label={`Show testimonial ${i + 1}`}
                                className={`h-1.5 rounded-full transition-all duration-500 ${i === index ? "w-10 bg-gray-900" : "w-4 bg-gray-300 hover:bg-gray-400"}`}
                            />
                        ))}
                    </div>
                </motion.div>

                <div className="relative h-[300px] sm:h-[260px]">
                    <AnimatePresence mode="wait">
                        <motion.figure
                            key={index}
                            initial={{ opacity: 0, y: 30, rotate: -1.5 }}
                            animate={{ opacity: 1, y: 0, rotate: 0 }}
                            exit={{ opacity: 0, y: -30, rotate: 1.5 }}
                            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                            className="absolute inset-0 rounded-[28px] bg-white border border-gray-200 p-8 shadow-[0_30px_60px_-40px_rgba(0,0,0,0.6)] flex flex-col justify-between"
                        >
                            <div>
                                <span className="text-indigo-500 text-3xl"><FaQuoteLeft /></span>
                                <blockquote className="mt-5 text-lg md:text-xl leading-relaxed text-gray-800">
                                    “{current.text}”
                                </blockquote>
                            </div>
                            <figcaption className="mt-6 flex items-center gap-3">
                                <span className="grid place-items-center w-10 h-10 rounded-full bg-gray-900 text-white text-sm font-semibold">
                                    {current.name.charAt(0)}
                                </span>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">{current.name}</p>
                                    <p className="text-xs text-gray-500">{current.role}</p>
                                </div>
                            </figcaption>
                        </motion.figure>
                    </AnimatePresence>
                </div>
            </div>
        </section>
    )
}

export default Testimonials
