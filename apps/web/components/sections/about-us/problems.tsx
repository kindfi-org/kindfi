'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '~/components/base/card'
import { Icon } from '~/components/base/icon'
import { mockAboutUs } from '~/lib/mock-data/mock-about-us'

interface Problem {
	title: string
	description: string
	icon: string
}

const Problems = () => {
	const problems: Problem[] = mockAboutUs.problems

	// Animation variants for staggered children
	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.2,
				delayChildren: 0.3
			}
		}
	}

	const itemVariants = {
		hidden: { opacity: 0, y: 30 },
		visible: { 
			opacity: 1, 
			y: 0,
			transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
		}
	}

	return (
		<section className="py-24 relative overflow-hidden">
			<div className="container mx-auto px-6 flex flex-col items-center relative z-10">
				<motion.div 
					className="text-center mb-16"
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
					viewport={{ once: true, amount: 0.2 }}
				>
					<h2 className="text-3xl md:text-4xl font-bold gradient-text inline-block mb-4">
						The Problems We're Solving
					</h2>
					<div className="w-20 h-1 bg-gradient-to-r from-green-500 to-blue-500 mx-auto rounded-full mb-4" />
					<p className="text-gray-700 text-lg max-w-2xl mx-auto">
						Traditional crowdfunding is broken. Here's how we fix it.
					</p>
				</motion.div>

				<motion.div 
					className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8 max-w-7xl"
					variants={containerVariants}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, amount: 0.1 }}
				>
					{problems.map((problem, index) => (
						<motion.div
							key={problem.title || `problem-${index}`}
							variants={itemVariants}
							whileHover={{ 
								y: -8,
								transition: { duration: 0.3 }
							}}
						>
							<Card className="h-full flex flex-col bg-white/90 backdrop-blur-sm border-0 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:shadow-green-200/50">
								<div className={`h-1.5 ${index % 3 === 0 ? 'bg-gradient-to-r from-green-500 to-blue-400' : 
                                  index % 3 === 1 ? 'bg-gradient-to-r from-blue-500 to-green-400' : 
                                  'bg-gradient-to-r from-violet-500 to-green-400'}`} />
								<div className="flex flex-col justify-start items-center p-8 h-full">
									<div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-6 ${
                                        index % 3 === 0 ? 'bg-green-100 text-green-600' : 
                                        index % 3 === 1 ? 'bg-blue-100 text-blue-600' : 
                                        'bg-violet-100 text-violet-600'}`}>
										<Icon
											name={problem.icon}
											className="text-4xl"
										/>
									</div>
									<CardContent className="flex flex-col text-center p-0 flex-1">
										<h3 className="text-xl font-bold text-gray-800 mb-3">
											{problem.title}
										</h3>
										<p className="text-gray-700 text-base leading-relaxed">
											{problem.description}
										</p>
									</CardContent>
								</div>
							</Card>
						</motion.div>
					))}
				</motion.div>
			</div>
		</section>
	)
}

export { Problems }