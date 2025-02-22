'use client'

import { Avatar, AvatarFallback, AvatarImage } from '~/components/base/avatar'
import { levelColors } from '~/lib/constants/impact-data/makers'
import type { ImpactMaker } from '~/lib/types/impact/impact-makers'
import { motion } from 'framer-motion'
import { Badge } from '~/components/base/badge-impact'

interface ImpactMakerCardProps {
	maker: ImpactMaker
	index: number
}

export function ImpactMakerCard({ maker, index }: ImpactMakerCardProps) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			whileInView={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, delay: index * 0.1 }}
			viewport={{ once: true }}
			className="rounded-2xl bg-white p-6 shadow-lg"
		>
			<div className="flex items-start gap-4">
				<Avatar className="h-16 w-16">
					<AvatarImage src={maker.image} alt={maker.name} />
					<AvatarFallback>{maker.name.charAt(0)}</AvatarFallback>
				</Avatar>

				<div className="flex-1">
					<h3 className="text-xl font-semibold">{maker.name}</h3>
					<p className={`text-sm ${levelColors[maker.level]}`}>
						{maker.level} Impact Maker
					</p>
				</div>
			</div>

			<div className="mt-6 space-y-4">
				<div className="grid grid-cols-2 gap-4">
					<div>
						<p className="text-sm text-gray-600">Total Impact</p>
						<p className="text-lg font-semibold">
							${maker.totalImpact.toLocaleString()}
						</p>
					</div>
					<div>
						<p className="text-sm text-gray-600">Projects Supported</p>
						<p className="text-lg font-semibold">{maker.projectsSupported}</p>
					</div>
				</div>

				<div className="flex flex-wrap gap-2">
					{maker.badges.map((badge) => (
						<Badge key={badge} label={badge} />
					))}
				</div>
			</div>
		</motion.div>
	)
}
