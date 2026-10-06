import { useState } from 'react'
import { FaRobot, FaSpinner, FaBuilding } from "react-icons/fa";
import { AiFillOpenAI } from "react-icons/ai";
import { motion } from "motion/react"
import { FcGoogle } from "react-icons/fc";
import { signInWithPopup } from "firebase/auth"
import { auth, provider } from '../utils/firebase';
import axios from 'axios';
import { ServerUrl } from '../App';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { setUserData } from '../redux/userSlice.js';

const friendlyError = (code) => {
    const map = {
        "auth/popup-blocked": "Your browser blocked the Google popup. Allow popups for this site and try again.",
        "auth/popup-closed-by-user": "Sign-in was cancelled before finishing. Please try again.",
        "auth/cancelled-popup-request": "Sign-in was cancelled. Please try again.",
        "auth/operation-not-allowed": "Google sign-in is disabled for this Firebase project. Enable the Google provider in Firebase console.",
        "auth/unauthorized-domain": "This domain is not authorised in Firebase. Add localhost to Authentication → Settings → Authorised domains.",
        "auth/invalid-api-key": "Firebase API key is missing or invalid. Check VITE_FIREBASE_APIKEY in frontend/.env.",
        "auth/network-request-failed": "Network error while contacting Firebase. Check your internet connection."
    }
    return map[code] || null
}

const homeFor = (user) => {
    if (!user) return "/auth"
    return user.role === "company" ? "/company" : "/dashboard"
}

function Auth() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const isCompany = searchParams.get("role") === "company"
    const { userData, authChecked } = useSelector((state) => state.user)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    if (authChecked && userData) {
        return <Navigate to={isCompany ? "/company" : homeFor(userData)} replace />
    }

    const handleGoogleAuth = async () => {
        setLoading(true)
        setError("")
        try {
            const response = await signInWithPopup(auth, provider)
            const { displayName, email } = response.user
            if (!email) {
                throw new Error("Google account has no email address")
            }

            const result = await axios.post(ServerUrl + "/api/auth/google",
                { name: displayName, email }, { withCredentials: true })

            const user = result.data.user || result.data
            dispatch(setUserData(user))
            navigate(isCompany ? "/company" : homeFor(user), { replace: true })
        } catch (err) {
            console.error("login failed", err)
            const known = friendlyError(err?.code)
            const serverMessage = err?.response?.data?.message
            setError(known || serverMessage || err?.message || "Login failed. Please try again.")
            dispatch(setUserData(null))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full min-h-screen bg-[#f5f5f5] flex items-center justify-center px-6 py-20">
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md p-8 bg-white rounded-3xl shadow-2xl border border-gray-200"
            >
                <div className="flex items-center justify-center mb-6 gap-3">
                    <div className="bg-black text-white p-2 rounded-lg">
                        {isCompany ? <FaBuilding /> : <FaRobot />}
                    </div>
                    <h2 className="font-semibold text-lg">Interview.hai</h2>
                </div>

                <span className={`mx-auto mb-4 flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${isCompany ? "bg-indigo-100 text-indigo-700" : "bg-green-100 text-green-700"}`}>
                    {isCompany ? <><FaBuilding /> Company &amp; Founder login</> : <><AiFillOpenAI /> Candidate login</>}
                </span>

                <h1 className="text-2xl md:text-3xl text-center leading-snug font-semibold mb-4">
                    {isCompany ? "Hire smarter with " : "Continue With "}
                    <span className={`px-3 py-1 rounded-full inline-flex items-center gap-2 ${isCompany ? "bg-indigo-100 text-indigo-700" : "bg-green-100 text-green-600"}`}>
                        {isCompany ? "Company Dashboard" : <><AiFillOpenAI /> AI Smart Interview</>}
                    </span>
                </h1>

                <p className="text-center text-sm text-gray-500 md:text-base leading-relaxed mb-8">
                    {isCompany
                        ? "Post jobs, upload your company's work and reach matched candidates — your founder dashboard lives here."
                        : "Get your dream job with AI Smart Interview, and unlock your full potential."}
                </p>

                <motion.button
                    onClick={handleGoogleAuth}
                    disabled={loading}
                    whileHover={{ opacity: loading ? 1 : 0.85, scale: loading ? 1 : 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full flex items-center justify-center gap-3 py-3 bg-black text-white rounded-full shadow-md disabled:opacity-70"
                >
                    {loading ? <FaSpinner className="animate-spin" /> : <FcGoogle size={24} />}
                    {loading ? "Signing you in..." : isCompany ? "Continue with Google as Company" : "Continue with Google Account"}
                </motion.button>

                <p className="mt-5 text-center text-xs text-gray-500">
                    {isCompany ? (
                        <>Looking for a job? <Link to="/auth" className="text-gray-900 underline underline-offset-4">Candidate login</Link></>
                    ) : (
                        <>Hiring or a founder? <Link to="/auth?role=company" className="text-gray-900 underline underline-offset-4">Company &amp; founder login</Link></>
                    )}
                </p>

                {error && (
                    <motion.p
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 text-center text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3"
                    >
                        {error}
                    </motion.p>
                )}
            </motion.div>
        </div>
    )
}

export default Auth
