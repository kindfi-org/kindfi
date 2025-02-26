'use client'

import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle } from '~/components/base/card'
import { mockAboutUs } from '~/lib/mock-data/mock-about-us'

const Roadmap = () => {
	return (
		<section className="py-16 flex flex-col items-center">
			<div className="text-center mb-12 px-4">
				<h2 className="text-3xl md:text-4xl font-bold">The Road Ahead</h2>
				<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
					Our vision for the future of social impact crowdfunding.
				</p>
			</div>
			<motion.div
				className="flex flex-wrap justify-center lg:flex-nowrap gap-6 w-full max-w-6xl px-6"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.8, ease: 'easeInOut' }}
			>
				{mockAboutUs.roadmap.map((item, index) => (
					<motion.div
						key={item.id}
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
						viewport={{ once: true }}
						className="flex-1 min-w-[280px] max-w-xs sm:max-w-sm md:max-w-md"
					>
						<Card className="h-52 p-6 shadow-lg bg-white hover:shadow-xl transition-all duration-300 border-none relative mx-auto">
							<motion.div
								className="absolute top-4 left-4 w-10 h-10 flex items-center justify-center rounded-full bg-black text-white font-bold text-lg"
								whileHover={{ scale: 1.1, rotate: 5 }}
								transition={{ type: 'spring', stiffness: 300 }}
							>
								{item.id}
							</motion.div>
							<CardHeader className="mt-10 flex flex-col items-center">
								<CardTitle className="text-lg text-center">
									{item.title}
								</CardTitle>
							</CardHeader>
						</Card>
					</motion.div>
				))}
			</motion.div>
		</section>
	)
}

export { Roadmap }
