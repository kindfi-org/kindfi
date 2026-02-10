'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
	CheckCircle2,
	Clock,
	Flag,
	Sparkles,
	Target,
	Trophy,
} from 'lucide-react'
import { useMemo } from 'react'
import { Badge } from '~/components/base/badge'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import { Progress } from '~/components/base/progress'
import { staggerContainer } from '~/lib/constants/animations'

interface Quest {
	id: string
	quest_id: number
	quest_type: string
	name: string
	description: string
	target_value: number
	reward_points: number
	expires_at: string | null
	is_active: boolean
	progress?: {
		current_value: number
		is_completed: boolean
		completed_at: string | null
	}
}

const questTypeIcons: Record<string, typeof Target> = {
	multi_region_donation: Target,
	weekly_streak: Clock,
	multi_category_donation: Flag,
	referral_quest: Trophy,
	total_donation_amount: Sparkles,
	quest_master: Trophy,
}

const questTypeColors: Record<string, string> = {
	multi_region_donation: 'bg-blue-100 text-blue-600',
	weekly_streak: 'bg-purple-100 text-purple-600',
	multi_category_donation: 'bg-green-100 text-green-600',
	referral_quest: 'bg-orange-100 text-orange-600',
	total_donation_amount: 'bg-yellow-100 text-yellow-600',
	quest_master: 'bg-pink-100 text-pink-600',
}

export function QuestEngine() {
	const { data, isLoading, error } = useQuery<{ quests: Quest[] }>({
		queryKey: ['quests'],
		queryFn: async () => {
			const response = await fetch('/api/quests')
			if (!response.ok) {
				throw new Error('Failed to fetch quests')
			}
			return response.json()
		},
		refetchInterval: 30000, // Refetch every 30 seconds
	})

	// Compute derived values using useMemo (must be before early returns)
	const quests = useMemo(() => data?.quests || [], [data?.quests])
	// Track completed quest IDs (for future use in animations/effects)
	const _completedQuests = useMemo(
		() =>
			new Set(
				quests
					.filter((q) => q.progress?.is_completed)
					.map((q) => q.quest_id),
			),
		[quests],
	)
	const activeQuests = useMemo(
		() => quests.filter((q) => !q.progress?.is_completed),
		[quests],
	)
	const completed = useMemo(
		() => quests.filter((q) => q.progress?.is_completed),
		[quests],
	)

	if (isLoading) {
		return (
			<Card>
				<CardContent className="py-12 text-center text-muted-foreground">
					Loading quests...
				</CardContent>
			</Card>
		)
	}

	if (error) {
		return (
			<Card className="border-red-200 bg-red-50">
				<CardContent className="py-12 text-center text-red-600">
					Error loading quests. Please try again.
				</CardContent>
			</Card>
		)
	}

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
						<Target className="h-6 w-6 text-primary" />
						Quest Engine
					</h2>
					<p className="text-muted-foreground mt-1">
						Complete quests to earn reputation points and level up
					</p>
				</div>
				<Badge variant="outline" className="text-sm">
					{completed.length} / {quests.length} Completed
				</Badge>
			</motion.div>

			{/* Active Quests */}
			{activeQuests.length > 0 && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className="space-y-4"
				>
					<h3 className="text-lg font-semibold">Active Quests</h3>
					<div className="grid gap-4 md:grid-cols-2">
						{activeQuests.map((quest, index) => (
							<QuestCard key={quest.id} quest={quest} index={index} />
						))}
					</div>
				</motion.div>
			)}

			{/* Completed Quests */}
			{completed.length > 0 && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className="space-y-4"
				>
					<h3 className="text-lg font-semibold flex items-center gap-2">
						<CheckCircle2 className="h-5 w-5 text-green-600" />
						Completed Quests
					</h3>
					<div className="grid gap-4 md:grid-cols-2">
						{completed.map((quest, index) => (
							<QuestCard key={quest.id} quest={quest} index={index} />
						))}
					</div>
				</motion.div>
			)}

			{quests.length === 0 && (
				<Card>
					<CardContent className="py-12 text-center text-muted-foreground">
						<p>No quests available at the moment.</p>
						<p className="text-sm mt-2">Check back soon for new challenges!</p>
					</CardContent>
				</Card>
			)}
		</motion.div>
	)
}

function QuestCard({ quest, index }: { quest: Quest; index: number }) {
	const Icon = questTypeIcons[quest.quest_type] || Target
	const typeColor = questTypeColors[quest.quest_type] || 'bg-gray-100 text-gray-600'
	const progress = quest.progress || { current_value: 0, is_completed: false }
	const progressPercentage = Math.min(
		(progress.current_value / quest.target_value) * 100,
		100,
	)
	const isCompleted = progress.is_completed
	const isExpired =
		quest.expires_at && new Date(quest.expires_at) < new Date()

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: index * 0.1 }}
			whileHover={{ y: -4 }}
		>
			<Card
				className={`relative overflow-hidden transition-all duration-300 ${
					isCompleted
						? 'bg-green-50 border-green-200'
						: isExpired
							? 'bg-gray-50 border-gray-200 opacity-60'
							: 'hover:shadow-lg'
				}`}
			>
				{/* Decorative overlay */}
				<div
					className={`absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 opacity-20 ${
						isCompleted ? 'bg-green-200' : 'bg-primary/10'
					}`}
				/>

				<CardHeader className="relative z-10 pb-3">
					<div className="flex items-start justify-between">
						<div className="flex items-center gap-3 flex-1">
							<div className={`p-2 rounded-lg ${typeColor}`}>
								<Icon className="h-5 w-5" />
							</div>
							<div className="flex-1 min-w-0">
								<CardTitle className="text-lg line-clamp-2">
									{quest.name}
								</CardTitle>
								<Badge variant="outline" className="mt-1 text-xs">
									{quest.reward_points} points
								</Badge>
							</div>
						</div>
						{isCompleted && (
							<motion.div
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								transition={{ type: 'spring' }}
							>
								<CheckCircle2 className="h-6 w-6 text-green-600" />
							</motion.div>
						)}
					</div>
				</CardHeader>

				<CardContent className="relative z-10 space-y-4">
					<p className="text-sm text-muted-foreground line-clamp-2">
						{quest.description}
					</p>

					{!isCompleted && (
						<div className="space-y-2">
							<div className="flex justify-between text-sm">
								<span className="text-muted-foreground">Progress</span>
								<span className="font-medium">
									{progress.current_value} / {quest.target_value}
								</span>
							</div>
							<Progress value={progressPercentage} className="h-2" />
							<p className="text-xs text-muted-foreground text-right">
								{progressPercentage.toFixed(0)}% complete
							</p>
						</div>
					)}

					{isCompleted && progress.completed_at && (
						<div className="flex items-center gap-2 text-sm text-green-600">
							<CheckCircle2 className="h-4 w-4" />
							<span>
								Completed{' '}
								{new Date(progress.completed_at).toLocaleDateString()}
							</span>
						</div>
					)}

					{quest.expires_at && !isCompleted && (
						<div className="flex items-center gap-2 text-xs text-muted-foreground">
							<Clock className="h-3 w-3" />
							<span>
								Expires{' '}
								{new Date(quest.expires_at).toLocaleDateString()}
							</span>
						</div>
					)}
				</CardContent>
			</Card>
		</motion.div>
	)
}
