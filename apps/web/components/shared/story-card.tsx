'use client'

import { motion } from 'framer-motion'
import { MapPin } from 'lucide-react'
import { IoIosLink } from 'react-icons/io'
import { Progress } from '~/components/base/progress'
import type { SuccessStory } from '~/lib/types/impact/success-story'

interface StoryCardProps {
	story: SuccessStory
}

export function StoryCard({ story }: StoryCardProps) {
	const progressPercentage = (story.raised / story.target) * 100

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			whileInView={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			viewport={{ once: true }}
			className="overflow-hidden rounded-2xl bg-white shadow-lg"
		>
			<div className="relative h-[200px] overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/60" />
				<img
					src={story.image || '/placeholder.svg'}
					alt={story.title}
					className="h-full w-full object-cover"
				/>
				<div className="absolute bottom-0 left-0 p-4 text-white">
					<div className="mb-2 flex items-center gap-1">
						<MapPin className="h-4 w-4" />
						<span className="text-sm">{story.location}</span>
					</div>
					<h3 className="text-xl font-semibold">{story.title}</h3>
				</div>
			</div>

			<div className="space-y-4 p-4">
				<div className="flex justify-between text-sm">
					<div className="flex items-center gap-2">
						<svg
							viewBox="0 0 24 24"
							className="h-4 w-4 fill-current"
							xmlns="http://www.w3.org/2000/svg"
						>
							<title>Donors Icon</title>
							<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
						</svg>
						<span>{story.donors} Donors</span>
					</div>
					<div className="flex items-center gap-2">
						<svg
							viewBox="0 0 24 24"
							className="h-4 w-4 fill-current"
							xmlns="http://www.w3.org/2000/svg"
						>
							<title>Milestones Completed</title>
							<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
						</svg>
						<span>
							{story.milestones.completed}/{story.milestones.total} Milestones
						</span>
					</div>
				</div>

				<div className="space-y-2">
					<div className="flex justify-between text-sm">
						<span className="font-bold">Raised</span>
						<span className="font-bold">${story.raised.toLocaleString()}</span>
					</div>
					<Progress value={progressPercentage} className="h-2" />
				</div>

				<div className="flex flex-wrap justify-center gap-4">
					<button
						type="button"
						className="group w-[90%] flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-bold transition-colors hover:bg-gray-50"
					>
						View Impact Details
						<IoIosLink className="transition-transform duration-200 group-hover:translate-x-1" />
					</button>
				</div>
			</div>
		</motion.div>
	)
}
