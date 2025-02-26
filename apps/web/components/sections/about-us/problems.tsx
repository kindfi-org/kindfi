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

	return (
		<section className="py-16 bg-gray-100 flex flex-col items-center">
			<div className="container mx-auto flex flex-col items-center">
				<h2 className="text-3xl font-bold text-gray-900 text-center">
					The Problems We're Solving
				</h2>
				<p className="text-gray-600 mt-2 max-w-2xl text-center">
					Traditional crowdfunding faces significant challenges that we're
					addressing through innovative technology.
				</p>
				<div className="flex flex-wrap justify-center gap-4 mt-10">
					{problems.map((problem, index) => (
						<motion.div
							key={problem.title || `problem-${index}`}
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: index * 0.2 }}
							viewport={{ once: true }}
						>
							<Card className="w-80 h-64 flex flex-col justify-center items-center bg-white shadow-lg rounded-xl hover:shadow-2xl transition p-6">
								<Icon
									name={problem.icon}
									className="text-gray-900 text-6xl mb-6"
								/>
								<CardContent className="flex flex-col text-center p-0">
									<h3 className="text-lg font-bold text-gray-900">
										{problem.title}
									</h3>
									<p className="text-gray-600 mt-2 text-sm">
										{problem.description}
									</p>
								</CardContent>
							</Card>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	)
}

export { Problems }
