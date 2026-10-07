import React, { useEffect, useRef, useState } from 'react'
import Navbar from '../components/Navbar.jsx'
import { ServerUrl } from '../App'
import axios from 'axios'
import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'motion/react'
import { Link, Navigate } from 'react-router-dom'
import { FaBuilding, FaSpinner, FaPlus, FaTrash, FaExternalLinkAlt, FaImages, FaCheck, FaTimes, FaUserTie } from 'react-icons/fa'
import { setUserData } from '../redux/userSlice.js'

const categories = [
    { value: "project", label: "Project" },
    { value: "product", label: "Product" },
    { value: "case_study", label: "Case study" },
    { value: "achievement", label: "Achievement" },
    { value: "other", label: "Other" }
]

const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } }
}

const item = {
    hidden: { opacity: 0, y: 22 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
}

function CompanyOnboarding({ userData }) {
    const dispatch = useDispatch()
    const [form, setForm] = useState({
        companyName: "",
        website: "",
        about: ""
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const submit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError("")
        try {
            const { data } = await axios.post(ServerUrl + "/api/user/company-profile", form, { withCredentials: true })
            dispatch(setUserData(data))
        } catch (err) {
            setError(err.response?.data?.message || "Could not save company profile")
        } finally {
            setLoading(false)
        }
    }

    return (
        <motion.form
            onSubmit={submit}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-xl bg-white rounded-[28px] border border-gray-200 p-8 shadow-sm"
        >
            <span className="grid place-items-center w-12 h-12 rounded-2xl bg-gray-900 text-white text-xl">
                <FaBuilding />
            </span>
            <h1 className="mt-5 text-2xl font-semibold text-gray-900">Set up your company space</h1>
            <p className="mt-2 text-sm text-gray-500">
                Hey {userData?.name?.split(" ")[0]} — create your founder/company profile to start uploading your work.
            </p>

            <div className="mt-6 flex flex-col gap-4">
                <div>
                    <label className="text-sm font-medium">Company / brand name</label>
                    <input
                        required
                        value={form.companyName}
                        onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                        placeholder="Acme Labs"
                        className="w-full mt-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                    />
                </div>
                <div>
                    <label className="text-sm font-medium">Website</label>
                    <input
                        value={form.website}
                        onChange={(e) => setForm({ ...form, website: e.target.value })}
                        placeholder="https://acmelabs.com"
                        className="w-full mt-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                    />
                </div>
                <div>
                    <label className="text-sm font-medium">About</label>
                    <textarea
                        rows="3"
                        value={form.about}
                        onChange={(e) => setForm({ ...form, about: e.target.value })}
                        placeholder="What your company builds and hires for"
                        className="w-full mt-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                    />
                </div>
            </div>

            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

            <button
                type="submit"
                disabled={loading}
                className="mt-6 w-full py-3 bg-black text-white rounded-full disabled:opacity-60 inline-flex items-center justify-center gap-2"
            >
                {loading ? <FaSpinner className="animate-spin" /> : <FaBuilding />}
                {loading ? "Saving..." : "Enter company dashboard"}
            </button>
        </motion.form>
    )
}

const candidateStatusStyles = {
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

const candidateStatusLabel = {
    matched: "Matched",
    hr_notified: "Awaiting your decision",
    hr_confirmed: "Interview confirmed",
    candidate_called: "Candidate called",
    human_review: "Human review",
    follow_up: "Follow up",
    delayed: "Candidate requested delay",
    next_job: "Ready for next role",
    rejected: "Rejected",
    failed: "Call failed"
}

function CompanyDashboard() {
    const { userData, authChecked } = useSelector((state) => state.user)
    const [works, setWorks] = useState([])
    const [loadingWorks, setLoadingWorks] = useState(true)
    const [candidates, setCandidates] = useState([])
    const [loadingCandidates, setLoadingCandidates] = useState(true)
    const [busyId, setBusyId] = useState("")
    const [submitting, setSubmitting] = useState(false)
    const [message, setMessage] = useState("")
    const [error, setError] = useState("")
    const [file, setFile] = useState(null)
    const [preview, setPreview] = useState("")
    const fileInput = useRef(null)
    const [form, setForm] = useState({
        title: "",
        description: "",
        category: "project",
        link: "",
        tags: ""
    })

    const loadWorks = async () => {
        setLoadingWorks(true)
        try {
            const { data } = await axios.get(ServerUrl + "/api/works/mine", { withCredentials: true })
            setWorks(data)
        } catch (err) {
            setError(err.response?.data?.message || "Could not load your uploads")
        } finally {
            setLoadingWorks(false)
        }
    }

    const loadCandidates = async () => {
        setLoadingCandidates(true)
        try {
            const { data } = await axios.get(ServerUrl + "/api/hiring/candidates", { withCredentials: true })
            setCandidates(Array.isArray(data) ? data : [])
        } catch (err) {
            setError(err.response?.data?.message || "Could not load matched candidates")
        } finally {
            setLoadingCandidates(false)
        }
    }

    useEffect(() => {
        if (userData?.role === "company") {
            loadWorks()
            loadCandidates()
        }
    }, [userData])

    const decide = async (id, action) => {
        setBusyId(id)
        setError("")
        setMessage("")
        try {
            await axios.post(`${ServerUrl}/api/hiring/interviews/${id}/${action}`, {}, { withCredentials: true })
            await loadCandidates()
            setMessage(action === "confirm"
                ? "Interview confirmed — the candidate is being called"
                : "Candidate rejected")
        } catch (err) {
            setError(err.response?.data?.message || "Could not update the candidate")
        } finally {
            setBusyId("")
        }
    }

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

    const handleFile = (e) => {
        const selected = e.target.files?.[0]
        if (!selected) return
        setFile(selected)
        setPreview(URL.createObjectURL(selected))
    }

    const submit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        setError("")
        setMessage("")
        try {
            const payload = new FormData()
            Object.entries(form).forEach(([key, value]) => payload.append(key, value))
            if (file) payload.append("image", file)

            const { data } = await axios.post(ServerUrl + "/api/works", payload, {
                withCredentials: true,
                headers: { "Content-Type": "multipart/form-data" }
            })

            setWorks((prev) => [data, ...prev])
            setForm({ title: "", description: "", category: "project", link: "", tags: "" })
            setFile(null)
            setPreview("")
            if (fileInput.current) fileInput.current.value = ""
            setMessage(`"${data.title}" uploaded`)
        } catch (err) {
            setError(err.response?.data?.message || "Upload failed")
        } finally {
            setSubmitting(false)
        }
    }

    const remove = async (id) => {
        try {
            await axios.delete(`${ServerUrl}/api/works/${id}`, { withCredentials: true })
            setWorks((prev) => prev.filter((w) => w._id !== id))
            setMessage("Work deleted")
        } catch (err) {
            setError(err.response?.data?.message || "Could not delete")
        }
    }

    if (!authChecked) {
        return (
            <div className="min-h-screen bg-[#f3f3f3] grid place-items-center text-gray-400">
                <FaSpinner className="animate-spin text-2xl" />
            </div>
        )
    }

    if (!userData) return <Navigate to="/auth" replace />

    if (userData.role !== "company") {
        return (
            <div className="min-h-screen bg-[#f3f3f3] flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center px-4 py-10">
                    <CompanyOnboarding userData={userData} />
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#f3f3f3] flex flex-col">
            <Navbar />

            <main className="mx-auto w-full max-w-6xl px-4 py-10 flex-1">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <span className="grid place-items-center w-14 h-14 rounded-2xl bg-indigo-600 text-white text-xl">
                                <FaBuilding />
                            </span>
                            <div>
                                <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Company / founder dashboard</p>
                                <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">{userData.companyName}</h1>
                                <p className="text-sm text-gray-500">
                                    {userData.website || userData.email}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Link to="/post-job" className="rounded-full bg-black text-white px-5 py-2.5 text-sm font-medium shadow-sm hover:opacity-90 transition-opacity">
                                Post a job
                            </Link>
                        </div>
                    </div>
                </motion.div>

                <div className="mt-8 grid lg:grid-cols-[1fr_1.2fr] gap-6 items-start">
                    <motion.form
                        onSubmit={submit}
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.6 }}
                        className="rounded-[28px] bg-white border border-gray-200 p-6 shadow-sm"
                    >
                        <h2 className="font-semibold text-gray-900 inline-flex items-center gap-2">
                            <FaPlus /> Upload your work
                        </h2>

                        <div className="mt-5 flex flex-col gap-4">
                            <div>
                                <label className="text-sm font-medium">Title</label>
                                <input
                                    name="title"
                                    required
                                    value={form.title}
                                    onChange={handleChange}
                                    placeholder="AI resume screener"
                                    className="w-full mt-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                                />
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Category</label>
                                    <select
                                        name="category"
                                        value={form.category}
                                        onChange={handleChange}
                                        className="w-full mt-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                                    >
                                        {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Link</label>
                                    <input
                                        name="link"
                                        value={form.link}
                                        onChange={handleChange}
                                        placeholder="https://github.com/..."
                                        className="w-full mt-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Description</label>
                                <textarea
                                    name="description"
                                    rows="3"
                                    value={form.description}
                                    onChange={handleChange}
                                    placeholder="What it does, the stack, and the impact"
                                    className="w-full mt-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Tags (comma separated)</label>
                                <input
                                    name="tags"
                                    value={form.tags}
                                    onChange={handleChange}
                                    placeholder="AI, SaaS, hiring"
                                    className="w-full mt-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Cover image</label>
                                <label className="mt-1 flex items-center gap-3 rounded-xl border border-dashed border-gray-300 px-4 py-3 cursor-pointer hover:border-gray-500 transition-colors">
                                    <span className="text-gray-400"><FaImages /></span>
                                    <span className="text-sm text-gray-600 truncate">
                                        {file ? file.name : "Choose an image (png, jpg, webp — max 5MB)"}
                                    </span>
                                    <input
                                        ref={fileInput}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFile}
                                        className="hidden"
                                    />
                                </label>
                                {preview && (
                                    <img src={preview} alt="preview" className="mt-3 h-36 w-full object-cover rounded-xl border border-gray-200" />
                                )}
                            </div>
                        </div>

                        {message && <p className="mt-4 text-sm text-green-600">{message}</p>}
                        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

                        <button
                            type="submit"
                            disabled={submitting}
                            className="mt-5 w-full py-3 bg-black text-white rounded-full disabled:opacity-60 inline-flex items-center justify-center gap-2"
                        >
                            {submitting ? <FaSpinner className="animate-spin" /> : <FaPlus />}
                            {submitting ? "Uploading..." : "Upload work"}
                        </button>
                    </motion.form>

                    <section className="rounded-[28px] bg-white border border-gray-200 p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <h2 className="font-semibold text-gray-900">Your uploads</h2>
                            <span className="text-xs text-gray-400">{works.length} items</span>
                        </div>

                        {loadingWorks && (
                            <div className="py-14 grid place-items-center text-gray-400">
                                <FaSpinner className="animate-spin text-xl" />
                            </div>
                        )}

                        {!loadingWorks && works.length === 0 && (
                            <div className="py-14 text-center">
                                <p className="text-sm text-gray-500">Nothing uploaded yet. Add your first piece of work on the left.</p>
                            </div>
                        )}

                        <motion.div variants={container} initial="hidden" animate="visible" className="mt-4 grid sm:grid-cols-2 gap-4">
                            <AnimatePresence>
                                {works.map((w) => (
                                    <motion.article
                                        key={w._id}
                                        variants={item}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        whileHover={{ y: -6 }}
                                        className="rounded-2xl border border-gray-200 overflow-hidden bg-white"
                                    >
                                        {w.image ? (
                                            <img src={`${ServerUrl}${w.image}`} alt={w.title} className="h-32 w-full object-cover" />
                                        ) : (
                                            <div className="h-32 w-full grid place-items-center bg-gradient-to-br from-gray-50 to-indigo-50 text-gray-300 text-3xl">
                                                <FaImages />
                                            </div>
                                        )}

                                        <div className="p-4">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900">{w.title}</p>
                                                    <p className="text-[11px] uppercase tracking-wider text-indigo-600">
                                                        {categories.find((c) => c.value === w.category)?.label || w.category}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => remove(w._id)}
                                                    aria-label="Delete work"
                                                    className="text-gray-300 hover:text-red-500 transition-colors"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>

                                            {w.description && (
                                                <p className="mt-2 text-xs text-gray-600 line-clamp-2">{w.description}</p>
                                            )}

                                            {w.tags?.length > 0 && (
                                                <div className="mt-3 flex flex-wrap gap-1.5">
                                                    {w.tags.map((t) => (
                                                        <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{t}</span>
                                                    ))}
                                                </div>
                                            )}

                                            {w.link && (
                                                <a
                                                    href={w.link}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="mt-3 inline-flex items-center gap-1.5 text-xs text-gray-700 underline underline-offset-4 hover:text-black"
                                                >
                                                    View <FaExternalLinkAlt />
                                                </a>
                                            )}
                                        </div>
                                    </motion.article>
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    </section>
                </div>

                <motion.section
                    variants={container}
                    initial="hidden"
                    animate="visible"
                    className="mt-6 rounded-[28px] bg-white border border-gray-200 p-6 shadow-sm"
                >
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-gray-900 inline-flex items-center gap-2">
                            <FaUserTie /> Matched candidates
                        </h2>
                        <span className="text-xs text-gray-400">{candidates.length} candidates</span>
                    </div>

                    {loadingCandidates && (
                        <div className="py-14 grid place-items-center text-gray-400">
                            <FaSpinner className="animate-spin text-xl" />
                        </div>
                    )}

                    {!loadingCandidates && candidates.length === 0 && (
                        <div className="py-12 text-center">
                            <p className="text-sm text-gray-500">
                                No candidates yet. Post a job and matching candidates will appear here.
                            </p>
                            <Link to="/post-job" className="mt-4 inline-block rounded-full bg-black text-white px-6 py-2.5 text-sm">
                                Post a job
                            </Link>
                        </div>
                    )}

                    {!loadingCandidates && candidates.length > 0 && (
                        <motion.div variants={container} className="mt-4 flex flex-col gap-3">
                            {candidates.map((c) => {
                                const pending = ["matched", "hr_notified", "human_review", "follow_up", "delayed"].includes(c.status)
                                return (
                                    <motion.article
                                        key={c._id}
                                        variants={item}
                                        whileHover={{ x: 6 }}
                                        className="rounded-2xl border border-gray-200 p-4 flex flex-wrap items-center justify-between gap-4"
                                    >
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-gray-900">
                                                {c.candidate?.name || "Candidate"}
                                                <span className="ml-2 text-xs font-normal text-gray-500">{c.candidate?.email}</span>
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {c.job?.title || "Role"}
                                                {c.job?.location ? ` · ${c.job.location}` : ""}
                                                {c.profile?.phone ? ` · ${c.profile.phone}` : ""}
                                            </p>
                                            <div className="mt-2 flex flex-wrap gap-1.5">
                                                {(c.profile?.skills || []).slice(0, 6).map((s) => (
                                                    <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-900 text-white">{s}</span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full">
                                                {c.matchScore}% match
                                            </span>
                                            <span className={`text-xs px-2.5 py-1 rounded-full ${candidateStatusStyles[c.status] || "bg-gray-100 text-gray-600"}`}>
                                                {candidateStatusLabel[c.status] || c.status}
                                            </span>

                                            {pending && (
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => decide(c._id, "confirm")}
                                                        disabled={busyId === c._id}
                                                        aria-label="Confirm interview"
                                                        className="inline-flex items-center gap-1.5 rounded-full bg-black text-white px-4 py-1.5 text-xs disabled:opacity-60"
                                                    >
                                                        {busyId === c._id ? <FaSpinner className="animate-spin" /> : <FaCheck />}
                                                        Confirm
                                                    </button>
                                                    <button
                                                        onClick={() => decide(c._id, "reject")}
                                                        disabled={busyId === c._id}
                                                        aria-label="Reject candidate"
                                                        className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 text-gray-600 px-4 py-1.5 text-xs hover:border-red-300 hover:text-red-600 disabled:opacity-60"
                                                    >
                                                        <FaTimes />
                                                        Reject
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </motion.article>
                                )
                            })}
                        </motion.div>
                    )}
                </motion.section>
            </main>
        </div>
    )
}

export default CompanyDashboard
