'use client'

import { Gem, Heart, Medal, Star, Trophy, Users } from 'lucide-react'
import { useId } from 'react'
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
	description,
	status,
	icon,
	progressPercentage,
	onClick,
}: AchievementCardProps & { onClick: () => void }) {
	const titleId = useId()
	const descriptionId = useId()
	const isLocked = status === 'locked'
	const Icon = icons[icon]
	const clampedProgress = Math.max(0, Math.min(100, progressPercentage ?? 0))

	return (
		<Card
			className={cn(
				'relative transition-all h-full',
				status === 'completed' && 'bg-primary/5 hover:bg-primary/10',
				status === 'in-progress' && 'bg-blue-50 hover:bg-blue-100',
				status === 'locked' && 'bg-muted/50 opacity-60 cursor-not-allowed',
			)}
		>
			<button
				type="button"
				aria-labelledby={titleId}
				aria-describedby={descriptionId}
				disabled={isLocked}
				onClick={isLocked ? undefined : onClick}
				className="absolute inset-0 z-10 rounded-lg cursor-pointer disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
			/>
			<CardContent className="flex flex-col items-center justify-center h-full px-4 py-3">
				<div
					className={cn(
						'p-2 rounded-full mb-2',
						status === 'completed' && 'bg-primary/20 text-primary',
						status === 'in-progress' && 'bg-blue-100 text-blue-600',
						status === 'locked' && 'bg-muted text-muted-foreground',
					)}
				>
					<Icon className="w-6 h-6 font-extrabold" />
				</div>
				<h3 id={titleId} className="text-md font-normal text-center">
					{title}
				</h3>
				<p
					id={descriptionId}
					className={cn(
						'text-sm mt-1',
						status === 'completed' && 'text-primary',
						status === 'in-progress' && 'text-blue-600',
						status === 'locked' && 'text-muted-foreground',
					)}
				>
					{description}
				</p>
				{status === 'in-progress' && progressPercentage !== undefined && (
					<div className="w-full mt-3 space-y-1">
						<div
							className="relative h-2 w-full overflow-hidden rounded-full bg-blue-100"
							role="progressbar"
							aria-valuenow={clampedProgress}
							aria-valuemin={0}
							aria-valuemax={100}
							aria-label={`Achievement progress: ${clampedProgress}% complete`}
						>
							<div
								className="absolute h-full w-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-in-out"
								style={{ width: `${clampedProgress}%` }}
							/>
						</div>
						<p className="text-xs font-medium text-blue-600 text-center">
							{clampedProgress}% Complete
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	)
}
