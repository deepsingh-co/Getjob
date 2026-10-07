import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar.jsx'
import { ServerUrl } from '../App'
import axios from 'axios'
import { useSelector } from 'react-redux'
import { motion } from 'motion/react'
import { Link, Navigate } from 'react-router-dom'
import { FaUser, FaBriefcase, FaCoins, FaPhoneAlt, FaCheckCircle, FaSpinner } from 'react-icons/fa'

const statusStyles = {
    matched: "bg-gray-100 text-gray-600",
    hr_notified: "bg-yellow-100 text-yellow-700",
    hr_confirmed: "bg-blue-100 text-blue-700",
    candidate_called: "bg-green-100 text-green-700",
    human_review: "bg-purple-100 text-purple-700",
    follow_up: "bg-orange-100 text-orange-700",
    delayed: "bg-amber-100 text-amber-700",
    next_job: "bg-teal-100 text-teal-700",
    rejected: "bg-red-100 text-red-600",
    failed: "bg-red-100 text-red-600"
}

const statusLabel = {
    matched: "Matched with a role",
    hr_notified: "Recruiter notified",
    hr_confirmed: "Interview confirmed",
    candidate_called: "You received a call",
    human_review: "Under human review",
    follow_up: "Follow-up scheduled",
    delayed: "Interview delayed",
    next_job: "Considered for next job",
    rejected: "Not selected",
    failed: "Call failed"
}

const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } }
}

const item = {
    hidden: { opacity: 0, y: 22 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
}

function Dashboard() {
    const { userData, authChecked } = useSelector((state) => state.user)
    const [profile, setProfile] = useState(null)
    const [interviews, setInterviews] = useState([])
    const [jobs, setJobs] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        if (!userData) return
        const load = async () => {
            setLoading(true)
            setError("")
            try {
                const [profileRes, interviewRes, jobsRes] = await Promise.all([
                    axios.get(ServerUrl + "/api/user/profile", { withCredentials: true })
                        .then((res) => res.data)
                        .catch((err) => (err.response?.status === 404 ? null : Promise.reject(err))),
                    axios.get(ServerUrl + "/api/hiring/my-interviews", { withCredentials: true })
                        .then((res) => res.data),
                    axios.get(ServerUrl + "/api/jobs/open", { withCredentials: true })
                        .then((res) => res.data)
                        .catch(() => [])
                ])
                setProfile(profileRes)
                setInterviews(interviewRes)
                setJobs(Array.isArray(jobsRes) ? jobsRes : [])
            } catch (err) {
                setError(err.response?.data?.message || "Could not load your dashboard")
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [userData])

    if (!authChecked) {
        return (
            <div className="min-h-screen bg-[#f3f3f3] grid place-items-center text-gray-400">
                <FaSpinner className="animate-spin text-2xl" />
            </div>
        )
    }

    if (!userData) {
        return <Navigate to="/auth" replace />
    }

    const confirmed = interviews.filter((i) => i.status === "candidate_called").length
    const pending = interviews.filter((i) => ["matched", "hr_notified", "hr_confirmed"].includes(i.status)).length

    const stats = [
        { icon: FaBriefcase, value: interviews.length, label: "Roles matched" },
        { icon: FaCheckCircle, value: confirmed, label: "Interviews confirmed" },
        { icon: FaPhoneAlt, value: pending, label: "Awaiting recruiter" },
        { icon: FaCoins, value: userData.credits ?? 0, label: "Credits left" }
    ]

    return (
        <div className="min-h-screen bg-[#f3f3f3] flex flex-col">
            <Navbar />

            <main className="mx-auto w-full max-w-6xl px-4 py-10 flex-1">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <span className="grid place-items-center w-14 h-14 rounded-2xl bg-black text-white text-xl font-semibold">
                                {(userData.name || "U").charAt(0).toUpperCase()}
                            </span>
                            <div>
                                <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Customer dashboard</p>
                                <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
                                    Hi, {userData.name?.split(" ")[0] || "there"}
                                </h1>
                                <p className="text-sm text-gray-500">{userData.email}</p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Link to="/profile" className="rounded-full bg-black text-white px-5 py-2.5 text-sm font-medium shadow-sm hover:opacity-90 transition-opacity">
                                {profile ? "Edit profile" : "Complete profile"}
                            </Link>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="visible"
                    className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4"
                >
                    {stats.map((s) => {
                        const Icon = s.icon
                        return (
                            <motion.div
                                key={s.label}
                                variants={item}
                                whileHover={{ y: -6 }}
                                className="rounded-3xl bg-white border border-gray-200 p-5 shadow-[0_20px_45px_-40px_rgba(0,0,0,0.7)]"
                            >
                                <span className="grid place-items-center w-10 h-10 rounded-2xl bg-gray-900 text-white">
                                    <Icon />
                                </span>
                                <p className="mt-4 text-3xl font-semibold text-gray-900">{s.value}</p>
                                <p className="text-xs text-gray-500">{s.label}</p>
                            </motion.div>
                        )
                    })}
                </motion.div>

                <div className="mt-6 grid lg:grid-cols-[1.4fr_1fr] gap-6 items-start">
                    <motion.section
                        variants={container}
                        initial="hidden"
                        animate="visible"
                        className="rounded-[28px] bg-white border border-gray-200 p-6 shadow-sm"
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="font-semibold text-gray-900">Your interview pipeline</h2>
                            <span className="text-xs text-gray-400">{interviews.length} total</span>
                        </div>

                        {loading && (
                            <div className="py-14 grid place-items-center text-gray-400">
                                <FaSpinner className="animate-spin text-xl" />
                            </div>
                        )}

                        {!loading && error && (
                            <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>
                        )}

                        {!loading && !error && interviews.length === 0 && (
                            <div className="py-12 text-center">
                                <p className="text-sm text-gray-500">No matches yet.</p>
                                <Link to="/profile" className="mt-4 inline-block rounded-full bg-black text-white px-6 py-2.5 text-sm">
                                    Complete your profile to get matched
                                </Link>
                            </div>
                        )}

                        {!loading && !error && interviews.length > 0 && (
                            <div className="mt-4 flex flex-col gap-3">
                                {interviews.map((interview) => (
                                    <motion.div
                                        key={interview._id}
                                        variants={item}
                                        whileHover={{ x: 6 }}
                                        className="rounded-2xl border border-gray-200 p-4 flex flex-wrap items-center justify-between gap-3"
                                    >
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {interview.job?.title || "Role"} · {interview.job?.company || "Company"}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {interview.matchScore}% skills match
                                                {interview.job?.interviewDateTime &&
                                                    ` · Interview ${new Date(interview.job.interviewDateTime).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}`}
                                            </p>
                                        </div>
                                        <span className={`text-xs px-2.5 py-1 rounded-full ${statusStyles[interview.status] || "bg-gray-100 text-gray-600"}`}>
                                            {statusLabel[interview.status] || interview.status}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.section>

                    <motion.section
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="rounded-[28px] bg-white border border-gray-200 p-6 shadow-sm"
                    >
                        <h2 className="font-semibold text-gray-900">Your profile</h2>

                        {!profile ? (
                            <div className="mt-4">
                                <p className="text-sm text-gray-500">Add your skills and phone number so recruiters and the AI matcher can reach you.</p>
                                <Link to="/profile" className="mt-4 inline-flex items-center gap-2 rounded-full bg-black text-white px-5 py-2.5 text-sm">
                                    <FaUser /> Complete profile
                                </Link>
                            </div>
                        ) : (
                            <div className="mt-4">
                                <div className="flex items-center gap-3">
                                    <span className="grid place-items-center w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600">
                                        <FaUser />
                                    </span>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{profile.headline || "Candidate"}</p>
                                        <p className="text-xs text-gray-500">{profile.phone} · {profile.location || "Location not set"}</p>
                                    </div>
                                </div>

                                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                                    <div className="rounded-xl bg-gray-50 p-3">
                                        <p className="text-xs text-gray-500">Experience</p>
                                        <p className="font-medium text-gray-900">{profile.experienceYears || 0} yrs</p>
                                    </div>
                                    <div className="rounded-xl bg-gray-50 p-3">
                                        <p className="text-xs text-gray-500">Open to work</p>
                                        <p className="font-medium text-gray-900">{profile.openToWork ? "Yes" : "Paused"}</p>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <p className="text-xs text-gray-500 mb-2">Skills</p>
                                    <div className="flex flex-wrap gap-2">
                                        {profile.skills?.length
                                            ? profile.skills.map((s) => (
                                                <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-gray-900 text-white">{s}</span>
                                            ))
                                            : <span className="text-xs text-gray-400">No skills added yet</span>}
                                    </div>
                                </div>

                                <Link to="/profile" className="mt-5 inline-block text-sm text-gray-700 underline underline-offset-4 hover:text-black">
                                    Edit profile
                                </Link>
                            </div>
                        )}
                    </motion.section>
                </div>

                <motion.section
                    variants={container}
                    initial="hidden"
                    animate="visible"
                    className="mt-6 rounded-[28px] bg-white border border-gray-200 p-6 shadow-sm"
                >
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-gray-900">Open jobs for you</h2>
                        <span className="text-xs text-gray-400">{jobs.length} active roles</span>
                    </div>

                    {loading && (
                        <div className="py-14 grid place-items-center text-gray-400">
                            <FaSpinner className="animate-spin text-xl" />
                        </div>
                    )}

                    {!loading && jobs.length === 0 && (
                        <p className="py-10 text-center text-sm text-gray-500">
                            No open roles right now — add skills to your profile so we can match you first.
                        </p>
                    )}

                    {!loading && jobs.length > 0 && (
                        <motion.div variants={container} className="mt-4 grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                            {jobs.map((job) => (
                                <motion.article
                                    key={job._id}
                                    variants={item}
                                    whileHover={{ y: -6 }}
                                    className="rounded-2xl border border-gray-200 p-5 flex flex-col"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">{job.title}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {job.company}{job.location ? ` · ${job.location}` : ""}
                                            </p>
                                        </div>
                                        {job.matchScore !== null && (
                                            <span className={`shrink-0 text-xs px-2.5 py-1 rounded-full ${job.matchScore >= 50
                                                ? "bg-green-100 text-green-700"
                                                : "bg-gray-100 text-gray-600"}`}>
                                                {job.matchScore}% match
                                            </span>
                                        )}
                                    </div>

                                    {job.description && (
                                        <p className="mt-3 text-xs text-gray-600 line-clamp-2">{job.description}</p>
                                    )}

                                    <div className="mt-3 flex flex-wrap gap-1.5">
                                        {(job.skills || []).slice(0, 5).map((s) => (
                                            <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-900 text-white">{s}</span>
                                        ))}
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                                        <span>{job.experienceYears || 0}+ yrs · {job.education === "any" ? "Any degree" : job.education}</span>
                                        {job.applicationStatus ? (
                                            <span className={`px-2 py-0.5 rounded-full ${statusStyles[job.applicationStatus] || "bg-gray-100 text-gray-600"}`}>
                                                {statusLabel[job.applicationStatus] || job.applicationStatus}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">Not matched yet</span>
                                        )}
                                    </div>
                                </motion.article>
                            ))}
                        </motion.div>
                    )}
                </motion.section>
            </main>
        </div>
    )
}

export default Dashboard
