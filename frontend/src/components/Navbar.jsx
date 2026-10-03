import React from 'react'
import { useSelector } from 'react-redux'
import { motion } from "motion/react"
import { Link, useNavigate } from 'react-router-dom'

function Navbar() {
    const { userData } = useSelector((state) => state.user)
    const navigate = useNavigate()

    return (
        <div className="bg-[#f3f3f3] flex justify-center px-4 pt-6">
            <motion.div
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-7xl bg-white rounded-[24px] shadow-sm border border-gray-200 px-8 py-4 flex justify-between items-center relative">
                <Link to="/" className="flex items-center gap-3 cursor-pointer">
                    <div className="bg-black text-white p-2 rounded-lg"></div>
                    <h1>Interview.Hai</h1>
                </Link>

                <div className="hidden md:flex items-center gap-6 text-sm">
                    <Link to="/" className="hover:text-gray-600">Home</Link>
                    <Link to="/post-job" className="hover:text-gray-600">Post Job</Link>
                    <Link to="/profile" className="hover:text-gray-600">Candidate Profile</Link>
                </div>

                <button
                    onClick={() => navigate(userData ? "/post-job" : "/auth")}
                    className="bg-black text-white text-sm px-5 py-2 rounded-full">
                    {userData ? "Post a Job" : "Login"}
                </button>
            </motion.div>
        </div>
    )
}

export default Navbar
