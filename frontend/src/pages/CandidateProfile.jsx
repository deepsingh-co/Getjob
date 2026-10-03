import React, { useState } from 'react'
import Navbar from '../components/Navbar.jsx'
import { ServerUrl } from '../App'
import axios from 'axios'
import { useSelector } from 'react-redux'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'

function CandidateProfile() {
    const { userData } = useSelector((state) => state.user)
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState("")
    const [form, setForm] = useState({
        phone: "",
        headline: "",
        skills: "",
        experienceYears: 0,
        education: "bachelors",
        location: "",
        summary: ""
    })

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

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
            await axios.post(ServerUrl + "/api/user/profile", payload, { withCredentials: true })
            setMessage("Profile saved. You will now be matched against new job posts.")
        } catch (error) {
            setMessage(error.response?.data?.message || "Failed to save profile")
        } finally {
            setLoading(false)
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
            <div className="flex-1 flex justify-center px-4 py-10">
                <motion.form
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-2xl bg-white rounded-[24px] border border-gray-200 p-8 shadow-sm"
                >
                    <h1 className="text-2xl font-semibold mb-1">Candidate Profile</h1>
                    <p className="text-sm text-gray-500 mb-6">Used by the system to match you with job posts and to place your confirmation call.</p>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium">Phone (with country code)</label>
                            <input name="phone" value={form.phone} onChange={handleChange} required placeholder="+919876543210"
                                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black" />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Headline</label>
                            <input name="headline" value={form.headline} onChange={handleChange} placeholder="Frontend Developer"
                                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-sm font-medium">Skills (comma separated)</label>
                            <input name="skills" value={form.skills} onChange={handleChange} placeholder="React, Node.js, MongoDB"
                                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black" />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Experience (years)</label>
                            <input type="number" min="0" name="experienceYears" value={form.experienceYears} onChange={handleChange}
                                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black" />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Education</label>
                            <select name="education" value={form.education} onChange={handleChange}
                                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black">
                                <option value="high_school">High School</option>
                                <option value="bachelors">Bachelor's</option>
                                <option value="masters">Master's</option>
                                <option value="phd">PhD</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-sm font-medium">Location</label>
                            <input name="location" value={form.location} onChange={handleChange} placeholder="Bengaluru"
                                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-sm font-medium">Summary</label>
                            <textarea name="summary" value={form.summary} onChange={handleChange} rows="3"
                                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black" />
                        </div>
                    </div>

                    {message && <p className="text-sm text-gray-600 mt-4">{message}</p>}

                    <button type="submit" disabled={loading}
                        className="mt-6 w-full py-3 bg-black text-white rounded-full disabled:opacity-60">
                        {loading ? "Saving..." : "Save Profile"}
                    </button>
                </motion.form>
            </div>
        </div>
    )
}

export default CandidateProfile
