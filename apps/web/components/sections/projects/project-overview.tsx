'use client'

import { motion } from 'framer-motion'

interface ProjectOverviewProps {
	title: string
	overview: string
	descriptionTitle: string
	descriptionParagraphs: string[]
	painPoints: string[]
}

export function ProjectOverview({
	title,
	overview,
	descriptionTitle,
	descriptionParagraphs,
	painPoints,
}: ProjectOverviewProps) {
	return (
		<div className="max-w-4xl mx-auto">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
			>
				<h1 className="text-3xl font-bold mb-4">{title}</h1>

				<p className="text-lg mb-8">{overview}</p>

				<h2 className="text-2xl font-bold mb-4">{descriptionTitle}</h2>

				<div className="bg-muted p-6 rounded-lg">
					{descriptionParagraphs.map((paragraph) => (
						<p key={paragraph.slice(0, 10)} className="mb-4">
							{paragraph}
						</p>
					))}

					{painPoints.length > 0 && (
						<>
							<p className="mb-4">
								Our solution addresses several critical pain points in the
								current energy storage market:
							</p>
							<ul className="list-disc pl-6 space-y-2">
								{painPoints.map((point) => (
									<li key={point}>{point}</li>
								))}
							</ul>
						</>
					)}
				</div>
			</motion.div>
		</div>
	)
}
