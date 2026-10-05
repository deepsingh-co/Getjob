import { useState } from 'react'
import { FaRobot, FaSpinner } from "react-icons/fa";
import { AiFillOpenAI } from "react-icons/ai";
import { motion } from "motion/react"
import { FcGoogle } from "react-icons/fc";
import { signInWithPopup } from "firebase/auth"
import { auth, provider } from '../utils/firebase';
import axios from 'axios';
import { ServerUrl } from '../App';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, useNavigate } from 'react-router-dom';
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

function Auth() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { userData, authChecked } = useSelector((state) => state.user)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    if (authChecked && userData) {
        return <Navigate to="/dashboard" replace />
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
            navigate("/dashboard", { replace: true })
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
                        <FaRobot />
                    </div>
                    <h2 className="font-semibold text-lg">Interview.hai</h2>
                </div>

                <h1 className="text-2xl md:text-3xl text-center leading-snug font-semibold mb-4">Continue With
                    <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full inline-flex items-center gap-2">
                        <AiFillOpenAI />
                        AI Smart Interview
                    </span>
                </h1>

                <p className="text-center text-sm text-gray-500 md:text-base leading-relaxed mb-8">
                    Get your dream job with AI Smart Interview, and unlock your full potential.
                </p>

                <motion.button
                    onClick={handleGoogleAuth}
                    disabled={loading}
                    whileHover={{ opacity: loading ? 1 : 0.85, scale: loading ? 1 : 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full flex items-center justify-center gap-3 py-3 bg-black text-white rounded-full shadow-md disabled:opacity-70"
                >
                    {loading ? <FaSpinner className="animate-spin" /> : <FcGoogle size={24} />}
                    {loading ? "Signing you in..." : "Continue with Google Account"}
                </motion.button>

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
