import React from 'react'
import { motion } from 'motion/react'
import Navbar from '../components/Navbar.jsx'
import Hero from '../components/landing/Hero.jsx'
import Marquee from '../components/landing/Marquee.jsx'
import Features from '../components/landing/Features.jsx'
import HowItWorks from '../components/landing/HowItWorks.jsx'
import Stats from '../components/landing/Stats.jsx'
import Testimonials from '../components/landing/Testimonials.jsx'
import CtaFooter from '../components/landing/CtaFooter.jsx'

function Home() {
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
                <HowItWorks />
                <Stats />
                <Testimonials />
                <CtaFooter />
            </motion.main>
        </div>
    )
}

export default Home
