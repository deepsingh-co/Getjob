import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { AnimatePresence, motion } from "motion/react"
import { Link, useNavigate } from 'react-router-dom'
import { HiMenu, HiX } from 'react-icons/hi'
import { FiLogOut } from 'react-icons/fi'
import axios from 'axios'
import { ServerUrl } from '../App'
import { setUserData } from '../redux/userSlice.js'

const links = [
    { to: "/", label: "Home" },
    { to: "/dashboard", label: "Dashboard", auth: true },
    { to: "/post-job", label: "Post Job" },
    { to: "/profile", label: "Candidate Profile" }
]

function Navbar() {
    const { userData } = useSelector((state) => state.user)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [scrolled, setScrolled] = useState(false)
    const [open, setOpen] = useState(false)
    const [loggingOut, setLoggingOut] = useState(false)

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20)
        onScroll()
        window.addEventListener("scroll", onScroll, { passive: true })
        return () => window.removeEventListener("scroll", onScroll)
    }, [])

    const handleLogout = async () => {
        if (loggingOut) return
        setLoggingOut(true)
        try {
            await axios.post(ServerUrl + "/api/auth/logout", {}, { withCredentials: true })
        } catch (error) {
            console.error("logout failed", error)
        } finally {
            dispatch(setUserData(null))
            setOpen(false)
            setLoggingOut(false)
            navigate("/")
        }
    }

    return (
        <div className="sticky top-0 z-50 bg-[#f3f3f3]/80 backdrop-blur-md flex justify-center px-4 pt-4">
            <motion.div
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className={`w-full max-w-7xl bg-white rounded-[24px] border border-gray-200 px-5 md:px-8 py-3 flex justify-between items-center relative transition-shadow duration-300 ${scrolled ? "shadow-lg shadow-black/5" : "shadow-sm"}`}>
                <Link to="/" className="flex items-center gap-3 cursor-pointer">
                    <motion.span
                        whileHover={{ rotate: 12, scale: 1.08 }}
                        className="bg-black text-white p-2 rounded-lg h-8 w-8 grid place-items-center text-xs font-semibold"
                    >IH</motion.span>
                    <h1 className="font-semibold">Interview.Hai</h1>
                </Link>

                <nav className="hidden md:flex items-center gap-1 text-sm">
                    {links.filter((l) => !l.auth || userData).map((l) => (
                        <motion.span key={l.to} whileHover={{ y: -2 }}>
                            <Link
                                to={l.to}
                                className="relative block px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors group"
                            >
                                {l.label}
                                <span className="absolute left-4 right-4 bottom-1 h-px bg-gray-900 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
                            </Link>
                        </motion.span>
                    ))}
                </nav>

                <div className="flex items-center gap-3">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(userData ? "/dashboard" : "/auth")}
                        className="bg-black text-white text-sm px-5 py-2 rounded-full">
                        {userData ? "Dashboard" : "Login"}
                    </motion.button>

                    {userData && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleLogout}
                            disabled={loggingOut}
                            aria-label="Logout"
                            className="hidden sm:inline-flex items-center gap-2 text-sm px-4 py-2 rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors disabled:opacity-60"
                        >
                            <FiLogOut />
                            Logout
                        </motion.button>
                    )}

                    <button
                        onClick={() => setOpen((v) => !v)}
                        aria-label="Toggle menu"
                        className="md:hidden grid place-items-center w-9 h-9 rounded-full border border-gray-200 text-lg">
                        {open ? <HiX /> : <HiMenu />}
                    </button>
                </div>

                <AnimatePresence>
                    {open && (
                        <motion.nav
                            initial={{ opacity: 0, y: -12, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: "auto" }}
                            exit={{ opacity: 0, y: -12, height: 0 }}
                            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                            className="absolute top-full mt-2 left-0 right-0 overflow-hidden rounded-3xl bg-white border border-gray-200 shadow-xl md:hidden"
                        >
                            <div className="p-3 flex flex-col">
                                {links.filter((l) => !l.auth || userData).map((l) => (
                                    <Link
                                        key={l.to}
                                        to={l.to}
                                        onClick={() => setOpen(false)}
                                        className="px-4 py-3 rounded-2xl text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        {l.label}
                                    </Link>
                                ))}

                                {userData && (
                                    <button
                                        onClick={handleLogout}
                                        disabled={loggingOut}
                                        className="flex items-center gap-2 px-4 py-3 rounded-2xl text-sm text-left text-red-600 hover:bg-red-50 transition-colors disabled:opacity-60"
                                    >
                                        <FiLogOut />
                                        Logout
                                    </button>
                                )}
                            </div>
                        </motion.nav>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    )
}

export default Navbar
