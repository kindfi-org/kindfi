'use client'

import { motion } from 'framer-motion'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/components/base/card'
import { Icon } from '~/components/base/icon'
import { mockAboutUs } from '~/lib/mock-data/mock-about-us'

export function WhyKindFiIsDifferent() {
  const { whyIsDifferent } = mockAboutUs

  // Animation variants for consistent animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
    }
  }

  return (
    <section className="w-full py-10 relative overflow-hidden">
      <div className="container mx-auto max-w-6xl relative z-10">
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why KindFi Is Different
          </h2>
          <p className="text-lg text-gray-700">
            Discover how KindFi transforms crowdfunding with transparency, accountability, and borderless participation powered by blockchain.
          </p>
        </motion.header>

        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {whyIsDifferent.map((feature, index) => (
            <motion.div
              key={feature.title || `feature-${index}`}
              variants={cardVariants}
              whileHover={{ 
                y: -8,
                transition: { duration: 0.3 }
              }}
            >
              <Card className="h-full border-0 bg-white/90 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:shadow-green-200/50">
                <div className={`h-1.5 bg-gradient-to-r ${
                  index % 3 === 0 ? 'from-green-500 to-indigo-400' : 
                  index % 3 === 1 ? 'from-indigo-500 to-green-400' : 
                  'from-green-500 to-green-400'
                }`} />
                
                <CardHeader className="flex flex-col items-center justify-center pt-8 pb-2 px-6">
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-5 ${
                    index % 3 === 0 ? 'bg-green-100 text-green-600' : 
                    index % 3 === 1 ? 'bg-indigo-100 text-indigo-600' : 
                    'bg-blue-100 text-blue-600'
                  }`}>
                    <Icon name={feature.icon || 'lock'} className="w-8 h-8" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-800 mb-2">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="px-6 pb-8 text-gray-700 leading-relaxed text-center">
                  {feature.description}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}