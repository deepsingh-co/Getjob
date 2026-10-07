import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { motion } from 'motion/react'
import { ServerUrl } from '../../App'

const categoryLabel = {
    project: "Project",
    product: "Product",
    case_study: "Case study",
    achievement: "Achievement",
    other: "Other"
}

function FeaturedWork() {
    const [works, setWorks] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let alive = true
        axios.get(ServerUrl + "/api/works")
            .then(({ data }) => {
                if (alive) setWorks(Array.isArray(data) ? data.slice(0, 6) : [])
            })
            .catch(() => { if (alive) setWorks([]) })
            .finally(() => { if (alive) setLoading(false) })
        return () => { alive = false }
    }, [])

    if (loading || works.length === 0) return null

    return (
        <section className="py-20 bg-white border-y border-gray-200">
            <div className="mx-auto max-w-7xl px-6">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col md:flex-row md:items-end justify-between gap-4"
                >
                    <div>
                        <p className="text-[11px] uppercase tracking-[0.3em] text-indigo-600">Work showcase</p>
                        <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-gray-900">
                            Shipped by companies hiring here
                        </h2>
                    </div>
                    <p className="text-sm text-gray-500 max-w-sm">
                        Real products, case studies and achievements uploaded from company &amp; founder dashboards.
                    </p>
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
                    className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
                >
                    {works.map((work) => (
                        <motion.article
                            key={work._id}
                            variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
                            whileHover={{ y: -6 }}
                            className="group rounded-3xl overflow-hidden bg-white border border-gray-200 shadow-[0_24px_60px_-45px_rgba(0,0,0,0.8)]"
                        >
                            <div className="h-44 bg-gray-100 overflow-hidden">
                                {work.image ? (
                                    <img
                                        src={ServerUrl + work.image}
                                        alt={work.title}
                                        loading="lazy"
                                        onError={(e) => { e.currentTarget.style.display = "none" }}
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                ) : null}
                            </div>
                            <div className="p-5">
                                <div className="flex items-center gap-2 text-[11px]">
                                    <span className="rounded-full bg-indigo-50 text-indigo-700 px-2.5 py-1 font-medium">
                                        {categoryLabel[work.category] || "Work"}
                                    </span>
                                    <span className="text-gray-500 truncate">{work.companyName || "Company"}</span>
                                </div>
                                <h3 className="mt-3 font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">
                                    {work.title}
                                </h3>
                                {work.description && (
                                    <p className="mt-1.5 text-sm text-gray-600 line-clamp-2">{work.description}</p>
                                )}
                            </div>
                        </motion.article>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}

export default FeaturedWork
