'use client'

import { motion } from 'framer-motion'
import { Button } from '~/components/base/button'

export default function CallToAction() {
  return (
    <section className="flex flex-col items-center text-center py-24 px-8 relative overflow-hidden font-custom">
      <motion.h2
        className="text-6xl font-bold text-black relative z-10 tracking-tight"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        viewport={{ once: true }}
      >
        Join the Movement
      </motion.h2>

      <motion.p
        className="text-2xl text-gray-700 mt-8 max-w-3xl relative z-10 leading-relaxed"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
        viewport={{ once: true }}
      >
        Be part of the future of social impact. Whether you're a donor, developer, or organization, 
        there's a place for you in the KindFi ecosystem.
      </motion.p>

      <motion.div
        className="flex flex-col sm:flex-row gap-8 mt-10 relative z-10"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
        viewport={{ once: true }}
      >
        <motion.div whileHover={{ scale: 1.1 }}>
          <Button
            size="lg"
            className="text-xl bg-black text-white border border-black hover:bg-gray-800 transition-all duration-300 px-12 py-5 shadow-lg font-custom"
          >
            Support a Project
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.1 }}>
          <Button
            size="lg"
            className="text-xl bg-white text-black border border-black hover:bg-gray-100 transition-all duration-300 px-12 py-5 shadow-lg font-custom"
          >
            Join as Developer
          </Button>
        </motion.div>
      </motion.div>
    </section>
  )
}
