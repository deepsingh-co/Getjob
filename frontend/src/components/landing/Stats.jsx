import React, { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'motion/react'
import axios from 'axios'
import { ServerUrl } from '../../App'

const format = (n) => (n >= 1000 ? `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : String(n))

function Counter({ value }) {
    const ref = useRef(null)
    const inView = useInView(ref, { once: false, amount: 0.6 })
    const [count, setCount] = useState(0)

    useEffect(() => {
        if (!inView || !value) return
        let frame
        const duration = 1600
        const start = performance.now()

        const tick = (now) => {
            const progress = Math.min((now - start) / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.round(value * eased))
            if (progress < 1) frame = requestAnimationFrame(tick)
        }

        frame = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(frame)
    }, [inView, value])

    return (
        <span ref={ref} className="text-4xl md:text-5xl font-semibold tracking-tight text-gray-900">
            {value ? `${format(count)}+` : "—"}
        </span>
    )
}

function Stats() {
    const [stats, setStats] = useState(null)

    useEffect(() => {
        axios.get(ServerUrl + "/api/stats")
            .then((res) => setStats(res.data))
            .catch(() => setStats({ candidates: 0, jobs: 0, matches: 0, confirmed: 0 }))
    }, [])

    const items = [
        { value: stats?.candidates ?? 0, label: "Registered candidates" },
        { value: stats?.jobs ?? 0, label: "Jobs posted by companies" },
        { value: stats?.matches ?? 0, label: "Candidate matches made" },
        { value: stats?.confirmed ?? 0, label: "Interviews confirmed" }
    ]

    return (
        <section className="mx-auto max-w-7xl px-6 py-20">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.7 }}
                className="grid grid-cols-2 lg:grid-cols-4 gap-6 rounded-[32px] border border-gray-200 bg-white p-8 md:p-10 shadow-[0_30px_70px_-50px_rgba(0,0,0,0.6)]"
            >
                {items.map((s) => (
                    <div key={s.label} className="text-center">
                        <Counter value={s.value} />
                        <p className="mt-2 text-xs md:text-sm text-gray-500">{s.label}</p>
                    </div>
                ))}
            </motion.div>
        </section>
    )
}

export default Stats
