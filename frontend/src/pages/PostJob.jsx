import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar.jsx'
import { ServerUrl } from '../App'
import axios from 'axios'
import { useSelector } from 'react-redux'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'

const statusColors = {
    matched: "bg-gray-100 text-gray-600",
    hr_notified: "bg-yellow-100 text-yellow-700",
    hr_confirmed: "bg-blue-100 text-blue-700",
    candidate_called: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-600",
    failed: "bg-red-100 text-red-600"
}

function PostJob() {
    const { userData } = useSelector((state) => state.user)
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState("")
    const [matches, setMatches] = useState([])
    const [result, setResult] = useState(null)
    const [jobs, setJobs] = useState([])
    const [busyId, setBusyId] = useState(null)
    const [form, setForm] = useState({
        title: "",
        company: "",
        description: "",
        skills: "",
        experienceYears: 0,
        education: "any",
        location: "",
        jobType: "full-time",
        interviewDateTime: "",
        hrName: "",
        hrPhone: ""
    })

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const loadJobs = async () => {
        try {
            const { data } = await axios.get(ServerUrl + "/api/jobs", { withCredentials: true })
            setJobs(data)
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        if (userData) loadJobs()
    }, [userData])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setMessage("")
        try {
            const payload = {
                ...form,
                skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
                experienceYears: Number(form.experienceYears)
            }
            const { data } = await axios.post(ServerUrl + "/api/jobs", payload, { withCredentials: true })
            setResult(data)
            setMatches(data.matches || [])
            const smsPart = data.notification?.notified
                ? `SMS sent to HR (${data.job.hrPhone})`
                : `SMS failed: ${data.notification?.reason || "HR could not be notified"}`
            const callPart = data.hrCall?.called
                ? (data.hrCall.dryRun
                    ? "HR call simulated (dry-run mode)"
                    : "automated HR call placed — press 1 confirm, 2 human review, 3 cancel, 4 follow up")
                : `HR call not placed: ${data.hrCall?.reason || "no matching candidates"}`
            setMessage(`Job posted (code ${data.job.refCode}). ${smsPart}. ${callPart}.`)
            loadJobs()
        } catch (error) {
            setMessage(error.response?.data?.message || "Failed to post job")
        } finally {
            setLoading(false)
        }
    }

    const loadMatches = async (jobId) => {
        try {
            const { data } = await axios.get(ServerUrl + `/api/jobs/${jobId}/matches`, { withCredentials: true })
            setMatches(data.matches)
            setResult(data)
            setMessage(`Matches for "${data.job.title}"`)
        } catch (error) {
            console.error(error)
        }
    }

    const actOnInterview = async (interviewId, action) => {
        setBusyId(interviewId)
        try {
            const { data } = await axios.post(
                ServerUrl + `/api/hiring/interviews/${interviewId}/${action}`,
                {},
                { withCredentials: true }
            )
            setMatches((prev) => prev.map((m) => (m._id === interviewId ? data.interview : m)))
            setMessage(data.message)
        } catch (error) {
            setMessage(error.response?.data?.message || `Failed to ${action} interview`)
        } finally {
            setBusyId(null)
        }
    }

    if (!userData) {
        return (
            <div className="min-h-screen bg-[#f3f3f3] flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <button onClick={() => navigate("/auth")} className="bg-black text-white px-6 py-3 rounded-full">Login to continue</button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#f3f3f3] flex flex-col">
            <Navbar />
            <div className="flex-1 px-4 py-10 mx-auto w-full max-w-6xl grid lg:grid-cols-[1.2fr_1fr] gap-6 items-start">

                <motion.form
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[24px] border border-gray-200 p-8 shadow-sm"
                >
                    <h1 className="text-2xl font-semibold mb-1">Post a Job</h1>
                    <p className="text-sm text-gray-500 mb-6">Posting a job auto-matches candidate profiles and notifies your HR on Twilio.</p>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium">Job title</label>
                            <input name="title" value={form.title} onChange={handleChange} required placeholder="React Developer"
                                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black" />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Company</label>
                            <input name="company" value={form.company} onChange={handleChange} required placeholder="Acme Pvt Ltd"
                                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-sm font-medium">Required skills (comma separated)</label>
                            <input name="skills" value={form.skills} onChange={handleChange} placeholder="React, JavaScript, REST API"
                                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black" />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Min experience (years)</label>
                            <input type="number" min="0" name="experienceYears" value={form.experienceYears} onChange={handleChange}
                                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black" />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Education</label>
                            <select name="education" value={form.education} onChange={handleChange}
                                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black">
                                <option value="any">Any</option>
                                <option value="high_school">High School</option>
                                <option value="bachelors">Bachelor's</option>
                                <option value="masters">Master's</option>
                                <option value="phd">PhD</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Location</label>
                            <input name="location" value={form.location} onChange={handleChange} placeholder="Bengaluru"
                                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black" />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Job type</label>
                            <select name="jobType" value={form.jobType} onChange={handleChange}
                                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black">
                                <option value="full-time">Full time</option>
                                <option value="part-time">Part time</option>
                                <option value="contract">Contract</option>
                                <option value="internship">Internship</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Interview date & time</label>
                            <input type="datetime-local" name="interviewDateTime" value={form.interviewDateTime} onChange={handleChange}
                                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black" />
                        </div>
                        <div>
                            <label className="text-sm font-medium">HR name</label>
                            <input name="hrName" value={form.hrName} onChange={handleChange} placeholder="Riya Sharma"
                                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-sm font-medium">HR phone (Twilio SMS goes here)</label>
                            <input name="hrPhone" value={form.hrPhone} onChange={handleChange} required placeholder="+919876543210"
                                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-sm font-medium">Description</label>
                            <textarea name="description" value={form.description} onChange={handleChange} rows="3"
                                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black" />
                        </div>
                    </div>

                    {message && <p className="text-sm text-gray-600 mt-4">{message}</p>}

                    <button type="submit" disabled={loading}
                        className="mt-6 w-full py-3 bg-black text-white rounded-full disabled:opacity-60">
                        {loading ? "Matching candidates..." : "Post job & notify HR"}
                    </button>
                </motion.form>

                <div className="flex flex-col gap-6">
                    <div className="bg-white rounded-[24px] border border-gray-200 p-6 shadow-sm">
                        <h2 className="font-semibold mb-3">Matched candidates</h2>
                        {matches.length === 0 && <p className="text-sm text-gray-500">No matches yet. Post a job to run matching.</p>}
                        <div className="flex flex-col gap-3">
                            {matches.map((m) => (
                                <div key={m._id} className="border border-gray-200 rounded-2xl p-4">
                                    <div className="flex items-center justify-between gap-2">
                                        <div>
                                            <p className="font-medium">{m.candidate?.name || "Candidate"}</p>
                                            <p className="text-xs text-gray-500">{m.matchedSkills?.join(", ") || "No matched skills"}</p>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full ${statusColors[m.status] || "bg-gray-100"}`}>{m.status}</span>
                                    </div>
                                    <div className="mt-2 flex items-center justify-between">
                                        <span className="text-sm font-semibold">{m.matchScore}% match</span>
                                        <div className="flex gap-2">
                                            <button
                                                disabled={busyId === m._id || m.status === "candidate_called" || m.status === "rejected"}
                                                onClick={() => actOnInterview(m._id, "confirm")}
                                                className="text-xs px-3 py-1.5 bg-black text-white rounded-full disabled:opacity-40">
                                                Confirm & Call
                                            </button>
                                            <button
                                                disabled={busyId === m._id || m.status === "rejected"}
                                                onClick={() => actOnInterview(m._id, "reject")}
                                                className="text-xs px-3 py-1.5 border border-gray-300 rounded-full disabled:opacity-40">
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-[24px] border border-gray-200 p-6 shadow-sm">
                        <h2 className="font-semibold mb-3">Your job posts</h2>
                        {jobs.length === 0 && <p className="text-sm text-gray-500">No jobs posted yet.</p>}
                        <div className="flex flex-col gap-2">
                            {jobs.map((job) => (
                                <button key={job._id} onClick={() => loadMatches(job._id)}
                                    className="text-left border border-gray-200 rounded-xl px-4 py-3 hover:bg-gray-50">
                                    <p className="text-sm font-medium">{job.title} · {job.company}</p>
                                    <p className="text-xs text-gray-500">Code {job.refCode} · HR {job.hrPhone}</p>
                                </button>
                            ))}
                        </div>
                        {result?.job?.refCode && (
                            <p className="text-xs text-gray-500 mt-3">
                                HR replies to Twilio SMS with: <span className="font-semibold">YES {result.job.refCode}</span>
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PostJob
