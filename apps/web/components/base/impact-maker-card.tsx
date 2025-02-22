'use client'

import { motion } from 'framer-motion'
import { RiMedalLine } from 'react-icons/ri'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/base/avatar'
import { Badge } from '~/components/base/badge-impact'
import type { ImpactMaker } from '~/lib/types/impact/impact-makers'

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
			className="rounded-3xl bg-white p-8 shadow-lg"
		>
			<div className="flex items-center gap-4">
				<Avatar className="h-16 w-16">
					<AvatarImage src={maker.image} alt={maker.name} />
					<AvatarFallback>{maker.name.charAt(0)}</AvatarFallback>
				</Avatar>

				<div>
					<h3 className="text-xl font-bold">{maker.name}</h3>
					<div className="mt-1 flex items-center gap-1.5 text-sm text-gray-600">
						<RiMedalLine className="h-4 w-4" />
						{maker.level} Impact Maker
					</div>
				</div>
			</div>

			<div className="mt-8 space-y-3">
				<div className="flex items-center justify-between text-gray-600">
					<span>Total Impact</span>
					<span className="font-bold text-black">
						${maker.totalImpact.toLocaleString()}
					</span>
				</div>
				<div className="flex items-center justify-between text-gray-600">
					<span>Projects Supported</span>
					<span className="font-bold text-black">
						{maker.projectsSupported}
					</span>
				</div>
			</div>

			<div className="mt-8 flex flex-wrap gap-2">
				{maker.badges.map((badge) => (
					<Badge key={badge} label={badge} />
				))}
			</div>
		</motion.div>
	)
}
