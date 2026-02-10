'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Calendar, Flame, TrendingUp, Zap } from 'lucide-react'
import { Badge } from '~/components/base/badge'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import { staggerContainer } from '~/lib/constants/animations'

interface Streak {
	id: string
	user_id: string
	period: 'weekly' | 'monthly'
	current_streak: number
	longest_streak: number
	last_donation_timestamp: string | null
}

export function StreakTracker() {
	const { data, isLoading, error } = useQuery<{ streaks: Streak[] }>({
		queryKey: ['streaks'],
		queryFn: async () => {
			const response = await fetch('/api/streaks')
			if (!response.ok) {
				throw new Error('Failed to fetch streaks')
			}
			return response.json()
		},
		refetchInterval: 60000, // Refetch every minute
	})

	if (isLoading) {
		return (
			<Card>
				<CardContent className="py-12 text-center text-muted-foreground">
					Loading streak data...
				</CardContent>
			</Card>
		)
	}

	if (error) {
		return (
			<Card className="border-red-200 bg-red-50">
				<CardContent className="py-12 text-center text-red-600">
					Error loading streaks. Please try again.
				</CardContent>
			</Card>
		)
	}

	const streaks = data?.streaks || []
	const weeklyStreak = streaks.find((s) => s.period === 'weekly')
	const monthlyStreak = streaks.find((s) => s.period === 'monthly')

	return (
		<motion.div
			variants={staggerContainer}
			initial="initial"
			animate="animate"
			className="space-y-6"
		>
			{/* Header */}
			<motion.div
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				className="flex items-center justify-between"
			>
				<div>
					<h2 className="text-2xl font-bold flex items-center gap-2">
						<Flame className="h-6 w-6 text-orange-500" />
						Donation Streaks
					</h2>
					<p className="text-muted-foreground mt-1">
						Maintain your streak to earn bonus reputation points
					</p>
				</div>
			</motion.div>

			{/* Streak Cards */}
			<div className="grid gap-4 md:grid-cols-2">
				{weeklyStreak && (
					<StreakCard
						streak={weeklyStreak}
						title="Weekly Streak"
						description="Donate every week to maintain your streak"
						icon={Calendar}
						color="bg-blue-100 text-blue-600"
						bonusPoints={25}
					/>
				)}
				{monthlyStreak && (
					<StreakCard
						streak={monthlyStreak}
						title="Monthly Streak"
						description="Donate every month to maintain your streak"
						icon={TrendingUp}
						color="bg-purple-100 text-purple-600"
						bonusPoints={25}
					/>
				)}
			</div>

			{/* Streak Info */}
			{streaks.length === 0 && (
				<Card>
					<CardContent className="py-12 text-center text-muted-foreground">
						<Flame className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
						<p className="font-medium">No streak yet</p>
						<p className="text-sm mt-2">
							Start donating to begin your streak journey!
						</p>
					</CardContent>
				</Card>
			)}

			{/* Streak Benefits */}
			{streaks.length > 0 && (
				<Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Zap className="h-5 w-5 text-orange-600" />
							Streak Benefits
						</CardTitle>
					</CardHeader>
					<CardContent>
						<ul className="space-y-2 text-sm">
							<li className="flex items-center gap-2">
								<Badge variant="outline" className="bg-white">
									+25 pts
								</Badge>
								<span>Bonus points for each streak donation</span>
							</li>
							<li className="flex items-center gap-2">
								<Badge variant="outline" className="bg-white">
									Reputation
								</Badge>
								<span>Boost your reputation tier faster</span>
							</li>
							<li className="flex items-center gap-2">
								<Badge variant="outline" className="bg-white">
									NFT
								</Badge>
								<span>Unlock higher NFT tiers with consistent giving</span>
							</li>
						</ul>
					</CardContent>
				</Card>
			)}
		</motion.div>
	)
}

function StreakCard({
	streak,
	title,
	description,
	icon: Icon,
	color,
	bonusPoints,
}: {
	streak: Streak
	title: string
	description: string
	icon: typeof Calendar
	color: string
	bonusPoints: number
}) {
	const lastDonation = streak.last_donation_timestamp
		? new Date(streak.last_donation_timestamp)
		: null
	const daysSinceLastDonation = lastDonation
		? Math.floor(
				(new Date().getTime() - lastDonation.getTime()) /
					(1000 * 60 * 60 * 24),
			)
		: null

	const periodDays = streak.period === 'weekly' ? 7 : 30
	const isActive =
		daysSinceLastDonation !== null && daysSinceLastDonation <= periodDays
	const daysRemaining = isActive
		? periodDays - (daysSinceLastDonation || 0)
		: 0

	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.95 }}
			animate={{ opacity: 1, scale: 1 }}
			whileHover={{ y: -4 }}
		>
			<Card
				className={`relative overflow-hidden transition-all duration-300 ${
					isActive ? 'border-orange-200 bg-orange-50/50' : ''
				}`}
			>
				{/* Decorative overlay */}
				<div className="absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 bg-orange-200/20" />

				<CardHeader className="relative z-10">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className={`p-2 rounded-lg ${color}`}>
								<Icon className="h-5 w-5" />
							</div>
							<div>
								<CardTitle className="text-lg">{title}</CardTitle>
								<p className="text-sm text-muted-foreground mt-1">
									{description}
								</p>
							</div>
						</div>
					</div>
				</CardHeader>

				<CardContent className="relative z-10 space-y-4">
					{/* Current Streak */}
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-muted-foreground">Current Streak</p>
							<motion.div
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								transition={{ type: 'spring', delay: 0.2 }}
								className="flex items-center gap-2 mt-1"
							>
								<Flame className="h-6 w-6 text-orange-500" />
								<span className="text-3xl font-bold text-orange-600">
									{streak.current_streak}
								</span>
								<span className="text-sm text-muted-foreground">
									{streak.period === 'weekly' ? 'weeks' : 'months'}
								</span>
							</motion.div>
						</div>
						<div className="text-right">
							<p className="text-sm text-muted-foreground">Longest</p>
							<p className="text-xl font-bold">{streak.longest_streak}</p>
						</div>
					</div>

					{/* Status */}
					{isActive && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							className="flex items-center gap-2 p-3 rounded-lg bg-orange-100"
						>
							<Zap className="h-4 w-4 text-orange-600" />
							<div className="flex-1">
								<p className="text-sm font-medium text-orange-900">
									Streak Active!
								</p>
								<p className="text-xs text-orange-700">
									{daysRemaining} day{daysRemaining !== 1 ? 's' : ''} until
									next donation
								</p>
							</div>
							<Badge className="bg-orange-600">
								+{bonusPoints} pts
							</Badge>
						</motion.div>
					)}

					{!isActive && lastDonation && (
						<div className="flex items-center gap-2 p-3 rounded-lg bg-gray-100">
							<Calendar className="h-4 w-4 text-gray-600" />
							<div className="flex-1">
								<p className="text-sm font-medium text-gray-900">
									Streak Paused
								</p>
								<p className="text-xs text-gray-700">
									Last donation{' '}
									{daysSinceLastDonation === 0
										? 'today'
										: `${daysSinceLastDonation} day${
												daysSinceLastDonation !== 1 ? 's' : ''
											} ago`}
								</p>
							</div>
						</div>
					)}

					{!lastDonation && (
						<div className="text-center py-4 text-muted-foreground">
							<p className="text-sm">Start your streak with your first donation</p>
						</div>
					)}
				</CardContent>
			</Card>
		</motion.div>
	)
}
