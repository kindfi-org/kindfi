'use client'

import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'

export interface Advantage {
	title: string
	description: string
}

export interface CompetitiveAdvantagesProps {
	title: string
	advantages: Advantage[]
}

export default function CompetitiveAdvantages({
	title,
	advantages,
}: CompetitiveAdvantagesProps) {
	return (
		<div className="max-w-4xl mx-auto bg-muted bg-border rounded-lg p-4">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
			>
				<h1 className="text-3xl font-bold mb-6">{title}</h1>

				<div className="space-y-6">
					{advantages.map((advantage) => (
						<motion.div
							key={advantage.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3, delay: 0.1 }}
							className="flex items-start gap-3"
						>
							<CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
							<div>
								<span className="font-semibold text-lg">{advantage.title}</span>
								<span className="text-muted-foreground">
									{' '}
									{advantage.description}
								</span>
							</div>
						</motion.div>
					))}
				</div>
			</motion.div>
		</div>
	)
}
