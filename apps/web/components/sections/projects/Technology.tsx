'use client'

import { motion } from 'framer-motion'

export interface TechnologyProps {
	title: string
	description: string
	features: { id: string; text: string }[]
}

export default function Technology({
	title,
	description,
	features,
}: TechnologyProps) {
	return (
		<div className="max-w-4xl mx-auto">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
			>
				<h1 className="text-3xl font-bold mb-4">{title}</h1>

				<p className="text-lg mb-6">{description}</p>

				<ul className="list-disc pl-6 space-y-4">
					{features.map((feature, index) => (
						<motion.li
							key={feature.id}
							initial={{ opacity: 0, x: -10 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
							className="text-lg text-muted-foreground"
						>
							{feature.text}
						</motion.li>
					))}
				</ul>
			</motion.div>
		</div>
	)
}
