import React, { useCallback, useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { motion } from 'motion/react'
import {
    FaArrowLeft, FaVideo, FaCopy, FaCheck,
    FaSpinner, FaPlay, FaPause, FaRedo, FaUserTie, FaSignOutAlt
} from 'react-icons/fa'
import { ServerUrl } from '../App'

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
    candidate_called: "Candidate called",
    human_review: "Under human review",
    follow_up: "Follow-up scheduled",
    delayed: "Interview delayed",
    next_job: "Considered for next job",
    rejected: "Not selected",
    failed: "Call failed"
}

const pad = (n) => String(n).padStart(2, "0")
const formatClock = (totalSeconds) => {
    const s = Math.max(0, Math.floor(totalSeconds))
    return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`
}

function TimerRing({ remaining, duration, running }) {
    const radius = 54
    const circumference = 2 * Math.PI * radius
    const ratio = duration > 0 ? remaining / duration : 0
    const offset = circumference * (1 - Math.max(0, Math.min(1, ratio)))
    const danger = remaining <= 60 && remaining > 0
    const warning = remaining <= 300 && remaining > 60
    const color = danger ? "#ef4444" : warning ? "#f59e0b" : "#6366f1"

    return (
        <div className="relative w-36 h-36 grid place-items-center">
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 128 128">
                <circle cx="64" cy="64" r={radius} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="8" />
                <motion.circle
                    cx="64"
                    cy="64"
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                />
            </svg>
            <div className="text-center">
                <p className={`text-3xl font-semibold tabular-nums ${danger ? "text-red-400" : "text-white"}`}>
                    {formatClock(remaining)}
                </p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/50 mt-1">
                    {remaining === 0 ? "Time up" : running ? "Interview time" : "Paused"}
                </p>
            </div>
        </div>
    )
}

function InterviewRoom() {
    const { id } = useParams()
    const { userData, authChecked } = useSelector((state) => state.user)
    const [interview, setInterview] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [inCall, setInCall] = useState(false)
    const [joining, setJoining] = useState(false)
    const [copied, setCopied] = useState(false)

    const durationSeconds = (interview?.meetingDuration || 30) * 60
    const storageKey = `ih-meeting-${id}`

    const [remaining, setRemaining] = useState(durationSeconds)
    const [running, setRunning] = useState(false)
    const [startedAt, setStartedAt] = useState(null)
    const startedAtRef = useRef(null)

    useEffect(() => {
        if (!authChecked || !userData) return
        const load = async () => {
            setLoading(true)
            setError("")
            try {
                const { data } = await axios.get(`${ServerUrl}/api/hiring/interviews/${id}`, { withCredentials: true })
                setInterview(data)
            } catch (err) {
                setError(err.response?.data?.message || "Could not load this interview")
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [authChecked, userData, id])

    useEffect(() => {
        const duration = (interview?.meetingDuration || 30) * 60
        if (!interview) return
        try {
            const saved = JSON.parse(localStorage.getItem(storageKey) || "null")
            if (saved?.startedAt) {
                const elapsed = Math.floor((Date.now() - saved.startedAt) / 1000)
                const left = Math.max(0, duration - elapsed)
                setRemaining(left)
                if (left > 0) {
                    setStartedAt(saved.startedAt)
                    startedAtRef.current = saved.startedAt
                    setRunning(true)
                } else {
                    setRemaining(0)
                    localStorage.removeItem(storageKey)
                }
            } else if (typeof saved?.remaining === "number") {
                setRemaining(Math.min(saved.remaining, duration))
            } else {
                setRemaining(duration)
            }
        } catch {
            setRemaining(duration)
        }
    }, [interview, storageKey])

    useEffect(() => {
        if (!running) return
        const tick = setInterval(() => {
            setRemaining((prev) => {
                if (prev <= 1) {
                    clearInterval(tick)
                    setRunning(false)
                    try { localStorage.removeItem(storageKey) } catch { }
                    return 0
                }
                return prev - 1
            })
        }, 1000)
        return () => clearInterval(tick)
    }, [running, storageKey])

    const markMeeting = useCallback(async (action) => {
        try {
            await axios.post(`${ServerUrl}/api/hiring/interviews/${id}/meeting`, { action }, { withCredentials: true })
        } catch {
            // non-blocking
        }
    }, [id])

    const startTimer = () => {
        if (remaining <= 0) setRemaining(durationSeconds)
        const started = Date.now()
        setStartedAt(started)
        startedAtRef.current = started
        setRunning(true)
        try {
            localStorage.setItem(storageKey, JSON.stringify({ startedAt: started }))
        } catch { }
        markMeeting("start")
    }

    const pauseTimer = () => {
        setRunning(false)
        setStartedAt(null)
        startedAtRef.current = null
        try {
            localStorage.setItem(storageKey, JSON.stringify({ remaining }))
        } catch { }
    }

    const resetTimer = () => {
        setRunning(false)
        setStartedAt(null)
        startedAtRef.current = null
        setRemaining(durationSeconds)
        try { localStorage.removeItem(storageKey) } catch { }
    }

    const toggleTimer = () => {
        if (running) pauseTimer()
        else startTimer()
    }

    const joinCall = () => {
        setJoining(true)
        setTimeout(() => {
            setInCall(true)
            setJoining(false)
            if (!running && remaining > 0) startTimer()
            markMeeting("start")
        }, 500)
    }

    const leaveCall = () => {
        setInCall(false)
        if (running) pauseTimer()
        markMeeting("end")
    }

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href)
            setCopied(true)
            setTimeout(() => setCopied(false), 1800)
        } catch { }
    }

    if (!authChecked) {
        return (
            <div className="min-h-screen bg-gray-950 grid place-items-center text-white/50">
                <FaSpinner className="animate-spin text-2xl" />
            </div>
        )
    }

    if (!userData) return <Navigate to="/auth" replace />

    const job = interview?.job
    const candidate = interview?.candidate
    const profile = interview?.profile
    const homeLink = userData.role === "company" ? "/company" : "/dashboard"
    const displayName = userData.name || "Guest"
    const roomName = `interviewhai-${id}`
    const jitsiUrl = `https://meet.jit.si/${roomName}#userInfo.displayName=%22${encodeURIComponent(displayName)}%22&config.prejoinPageEnabled=false&config.startWithAudioMuted=true&config.disableDeepLinking=true&config.requireDisplayName=false`

    return (
        <div className="min-h-screen bg-gray-950 text-white flex flex-col">
            <header className="border-b border-white/10 px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <Link
                        to={homeLink}
                        className="grid place-items-center w-9 h-9 rounded-full border border-white/15 text-white/70 hover:text-white hover:bg-white/10 transition-colors shrink-0"
                        aria-label="Back to dashboard"
                    >
                        <FaArrowLeft className="text-sm" />
                    </Link>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">
                            {job?.title || "Interview"} <span className="text-white/40 font-normal">· {job?.company || "Company"}</span>
                        </p>
                        <p className="text-[11px] text-white/40 truncate">
                            {userData.role === "company" ? (candidate?.name || "Candidate") : `with ${job?.hrName || job?.company || "Recruiter"}`}
                            {job?.interviewDateTime ? ` · ${new Date(job.interviewDateTime).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}` : ""}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={copyLink}
                        className="hidden sm:inline-flex items-center gap-2 text-xs px-3 py-2 rounded-full border border-white/15 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        {copied ? <FaCheck /> : <FaCopy />}
                        {copied ? "Copied" : "Copy invite link"}
                    </button>
                    <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full bg-white/10 text-white/70">
                        <span className={`w-1.5 h-1.5 rounded-full ${inCall ? "bg-green-400 animate-pulse" : "bg-white/40"}`} />
                        {inCall ? "Live" : "Not joined"}
                    </span>
                </div>
            </header>

            {loading ? (
                <div className="flex-1 grid place-items-center text-white/40">
                    <div className="text-center">
                        <FaSpinner className="animate-spin text-3xl mx-auto" />
                        <p className="mt-3 text-sm">Loading interview room…</p>
                    </div>
                </div>
            ) : error ? (
                <div className="flex-1 grid place-items-center px-4">
                    <div className="text-center max-w-md">
                        <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-2xl px-5 py-4">{error}</p>
                        <Link to={homeLink} className="mt-5 inline-block rounded-full bg-white text-gray-900 px-6 py-2.5 text-sm font-medium">
                            Back to dashboard
                        </Link>
                    </div>
                </div>
            ) : (
                <main className="flex-1 flex flex-col lg:flex-row gap-4 p-4 sm:p-6 max-w-[1500px] w-full mx-auto">
                    <section className="flex-1 min-h-[52vh] lg:min-h-0 rounded-[24px] overflow-hidden border border-white/10 bg-gray-900 relative">
                        {inCall ? (
                            <>
                                <iframe
                                    key={jitsiUrl}
                                    src={jitsiUrl}
                                    title="Live interview video call"
                                    allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-write"
                                    allowFullScreen
                                    className="absolute inset-0 w-full h-full border-0"
                                />
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-gray-950/80 backdrop-blur rounded-full px-2 py-2 border border-white/10">
                                    <button
                                        onClick={copyLink}
                                        className="grid place-items-center w-10 h-10 rounded-full text-white/70 hover:bg-white/10 sm:hidden"
                                        aria-label="Copy invite link"
                                    >
                                        {copied ? <FaCheck /> : <FaCopy />}
                                    </button>
                                    <button
                                        onClick={toggleTimer}
                                        className="inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 px-4 py-2 text-xs font-medium transition-colors"
                                    >
                                        {running ? <FaPause /> : <FaPlay />}
                                        {running ? "Pause timer" : "Resume timer"}
                                    </button>
                                    <button
                                        onClick={leaveCall}
                                        className="inline-flex items-center gap-2 rounded-full bg-red-500 hover:bg-red-400 px-4 py-2 text-xs font-medium transition-colors"
                                    >
                                        <FaSignOutAlt />
                                        Leave
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="absolute inset-0 grid place-items-center px-6">
                                <div className="text-center max-w-md">
                                    <motion.span
                                        initial={{ scale: 0.85, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="mx-auto grid place-items-center w-16 h-16 rounded-3xl bg-indigo-500/20 text-indigo-300"
                                    >
                                        <FaVideo className="text-2xl" />
                                    </motion.span>
                                    <h2 className="mt-5 text-2xl font-semibold">Ready to join the interview?</h2>
                                    <p className="mt-2 text-sm text-white/50 leading-relaxed">
                                        Secure video room with camera, microphone and screen sharing.
                                        {userData.role === "company"
                                            ? " The candidate joins through the same interview link."
                                            : " Your recruiter will join through the same link."}
                                    </p>
                                    <p className="mt-3 text-[11px] text-white/30">
                                        Room: {roomName}
                                    </p>
                                    <button
                                        onClick={joinCall}
                                        disabled={joining}
                                        className="mt-6 inline-flex items-center gap-2 rounded-full bg-white text-gray-900 px-7 py-3 text-sm font-semibold hover:bg-white/90 transition-colors disabled:opacity-60"
                                    >
                                        {joining ? <FaSpinner className="animate-spin" /> : <FaVideo />}
                                        {joining ? "Joining…" : "Join video call"}
                                    </button>
                                    <div>
                                        <a
                                            href={jitsiUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="mt-3 inline-block text-[11px] text-white/40 underline underline-offset-4 hover:text-white/70"
                                        >
                                            Having trouble? Open the video room in a new tab
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>

                    <aside className="lg:w-[330px] shrink-0 flex flex-col gap-4">
                        <div className="rounded-[24px] border border-white/10 bg-gray-900 p-5 flex flex-col items-center">
                            <TimerRing remaining={remaining} duration={durationSeconds} running={running} />
                            <div className="mt-4 flex items-center gap-2">
                                <button
                                    onClick={toggleTimer}
                                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-colors ${running
                                        ? "bg-white/10 hover:bg-white/20"
                                        : "bg-indigo-500 hover:bg-indigo-400"
                                        }`}
                                >
                                    {running ? <FaPause /> : <FaPlay />}
                                    {running ? "Pause" : remaining === 0 ? "Restart" : startedAt ? "Resume" : "Start timer"}
                                </button>
                                <button
                                    onClick={resetTimer}
                                    className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                                >
                                    <FaRedo />
                                    Reset
                                </button>
                            </div>
                            <p className="mt-3 text-[11px] text-white/40 text-center">
                                {interview.meetingStartedAt
                                    ? `Session started ${new Date(interview.meetingStartedAt).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}`
                                    : "Timer starts automatically when you join"}
                            </p>
                        </div>

                        <div className="rounded-[24px] border border-white/10 bg-gray-900 p-5">
                            <h3 className="text-xs uppercase tracking-[0.2em] text-white/40">Interview details</h3>
                            <div className="mt-4 flex flex-col gap-3 text-sm">
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-white/50">{userData.role === "company" ? "Candidate" : "Role"}</span>
                                    <span className="font-medium text-right truncate">
                                        {userData.role === "company" ? (candidate?.name || "—") : (job?.title || "—")}
                                    </span>
                                </div>
                                {userData.role === "company" && (
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-white/50">Role</span>
                                        <span className="font-medium text-right truncate">{job?.title || "—"}</span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-white/50">Company</span>
                                    <span className="font-medium text-right truncate">{job?.company || "—"}</span>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-white/50">Location</span>
                                    <span className="font-medium text-right truncate">{job?.location || "Remote"}</span>
                                </div>
                                {userData.role === "company" && (
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-white/50">Phone</span>
                                        <span className="font-medium text-right truncate">{profile?.phone || "—"}</span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-white/50">Match score</span>
                                    <span className="font-medium text-indigo-300">{interview.matchScore ?? 0}%</span>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-white/50">Status</span>
                                    <span className={`text-[11px] px-2.5 py-1 rounded-full ${statusStyles[interview.status] || "bg-gray-100 text-gray-600"}`}>
                                        {statusLabel[interview.status] || interview.status}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-[24px] border border-white/10 bg-gray-900 p-5">
                            <h3 className="text-xs uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
                                <FaUserTie /> Participants
                            </h3>
                            <div className="mt-4 flex flex-col gap-3">
                                <div className="flex items-center gap-3">
                                    <span className="grid place-items-center w-9 h-9 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold">
                                        {(candidate?.name || "C").charAt(0).toUpperCase()}
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-sm truncate">{candidate?.name || "Candidate"}</p>
                                        <p className="text-[11px] text-white/40">Candidate</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="grid place-items-center w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
                                        {(job?.hrName || job?.company || "HR").charAt(0).toUpperCase()}
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-sm truncate">{job?.hrName || "Recruiter"}</p>
                                        <p className="text-[11px] text-white/40">Recruiter · {job?.company || "Company"}</p>
                                    </div>
                                </div>
                            </div>
                            <p className="mt-4 text-[11px] text-white/35 leading-relaxed">
                                Screen sharing: use the screen-share button inside the video toolbar (works on desktop Chrome/Edge).
                            </p>
                        </div>
                    </aside>
                </main>
            )}
        </div>
    )
}

export default InterviewRoom