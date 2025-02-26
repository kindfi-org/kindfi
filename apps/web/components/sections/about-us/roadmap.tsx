"use client"

import { mockAboutUs } from '~/lib/constants/mock-data/mock-about-us'
import { Card, CardHeader, CardTitle } from '~/components/base/card'
import { motion } from 'framer-motion'

export default function Roadmap() {
  return (
    <section className="py-16 flex flex-col items-center">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold">The Road Ahead</h2>
        <p className="text-lg text-muted-foreground">
          Our vision for the future of social impact crowdfunding.
        </p>
      </div>
      <motion.div 
        className="flex justify-center gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      >
        {mockAboutUs.roadmap.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <Card className="w-72 h-52 p-6 shadow-lg bg-white hover:shadow-xl transition-all duration-300 border-none relative">
              <motion.div 
                className="absolute top-4 left-4 w-10 h-10 flex items-center justify-center rounded-full bg-black text-white font-bold text-lg"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {item.id}
              </motion.div>
              <CardHeader className="mt-10 flex flex-col items-center">
                <CardTitle className="text-lg text-center">{item.title}</CardTitle>
              </CardHeader>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
