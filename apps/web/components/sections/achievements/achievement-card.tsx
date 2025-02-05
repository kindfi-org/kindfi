'use client'

import { Gem, Heart, Medal, Star, Trophy, Users } from 'lucide-react'
import { Card, CardContent } from '~/components/base/card'
import type { AchievementCardProps } from '~/lib/types'
import { cn } from '~/lib/utils'

const icons = {
	trophy: Trophy,
	award: Medal,
	heart: Heart,
	star: Star,
	diamond: Gem,
	users: Users,
}

export function AchievementCard({
	title,
	subtitle,
	status,
	icon,
	onClick,
}: AchievementCardProps & { onClick: () => void }) {
	const Icon = icons[icon]

	return (
		<Card
			onClick={onClick}
			className={cn(
				'transition-all h-full cursor-pointer',
				status === 'earned' && 'bg-primary/5 hover:bg-primary/10',
				status === 'in-progress' && 'bg-blue-50 hover:bg-blue-100',
				status === 'locked' && 'bg-muted/50 opacity-60 cursor-not-allowed',
			)}
		>
			<CardContent className="flex flex-col items-center justify-center h-full px-4 py-3">
				<div
					className={cn(
						'p-2 rounded-full mb-2',
						status === 'earned' && 'bg-primary/20 text-primary',
						status === 'in-progress' && 'bg-blue-100 text-blue-600',
						status === 'locked' && 'bg-muted text-muted-foreground',
					)}
				>
					<Icon className="w-6 h-6 font-extrabold" />
				</div>
				<h3 className="text-md font-normal text-center">{title}</h3>
				{subtitle && (
					<p
						className={cn(
							'text-sm mt-1',
							status === 'earned' && 'text-primary',
							status === 'in-progress' && 'text-blue-600',
							status === 'locked' && 'text-muted-foreground',
						)}
					>
						{subtitle}
					</p>
				)}
			</CardContent>
		</Card>
	)
}
