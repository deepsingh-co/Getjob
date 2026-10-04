import React from 'react'
import { motion } from 'motion/react'

const brands = ["Google", "Amazon", "Microsoft", "Infosys", "TCS", "Wipro", "Zomato", "Flipkart", "Swiggy", "Accenture", "Deloitte", "IBM"]

function Marquee() {
    const row = [...brands, ...brands]

    return (
        <section className="py-10 border-y border-gray-200 bg-white/60 overflow-hidden">
            <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-center text-[11px] uppercase tracking-[0.3em] text-gray-400 mb-6"
            >
                Candidates hired at
            </motion.p>

            <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10" />
                <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10" />

                <div className="flex w-max animate-marquee">
                    {row.map((brand, i) => (
                        <span key={i} className="mx-8 text-lg md:text-xl font-semibold text-gray-300 hover:text-gray-900 transition-colors duration-300 select-none">
                            {brand}
                        </span>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Marquee
