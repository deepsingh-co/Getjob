import React from 'react'
import { motion } from 'motion/react'
import { useSelector } from 'react-redux'
import Navbar from '../components/Navbar.jsx'
import Dashboard from './Dashboard.jsx'
import CompanyDashboard from './CompanyDashboard.jsx'
import Hero from '../components/landing/Hero.jsx'
import Marquee from '../components/landing/Marquee.jsx'
import Features from '../components/landing/Features.jsx'
import FeaturedWork from '../components/landing/FeaturedWork.jsx'
import HowItWorks from '../components/landing/HowItWorks.jsx'
import Stats from '../components/landing/Stats.jsx'
import Testimonials from '../components/landing/Testimonials.jsx'
import CtaFooter from '../components/landing/CtaFooter.jsx'

function Home() {
    const { userData, authChecked } = useSelector((state) => state.user)

    if (authChecked && userData) {
        return userData.role === "company" ? <CompanyDashboard /> : <Dashboard />
    }

    return (
        <div className="min-h-screen bg-[#f3f3f3] flex flex-col overflow-x-hidden">
            <Navbar />
            <motion.main
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="flex-1"
            >
                <Hero />
                <Marquee />
                <Features />
                <FeaturedWork />
                <HowItWorks />
                <Stats />
                <Testimonials />
                <CtaFooter />
            </motion.main>
        </div>
    )
}

export default Home
