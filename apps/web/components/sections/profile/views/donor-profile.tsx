'use client'

import { useSupabaseQuery } from '@packages/lib/hooks'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Heart, Trophy } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/base/card'
import { Button } from '~/components/base/button'
import { Badge } from '~/components/base/badge'
import { getUserSupportedProjects } from '~/lib/queries/projects/get-user-projects'
import { Progress } from '~/components/base/progress'
import Image from 'next/image'
import { AchievementsGrid } from '~/components/sections/achievements/achievement-grid'
import { ImpactCard } from '~/components/sections/user/impact-generated-section'
import { TransactionHistory } from '~/components/sections/user/transaction-history-section'
import { staggerContainer } from '~/lib/constants/animations'

interface DonorProfileProps {
	userId: string
	displayName: string
}

const cardVariants = {
	hidden: { opacity: 0, y: 20 },
	show: { 
		opacity: 1, 
		y: 0,
		transition: {
			type: 'spring',
			stiffness: 100,
			damping: 12,
		},
	},
}

export function DonorProfile({ userId, displayName }: DonorProfileProps) {
	const {
		data: supportedProjects = [],
		isLoading,
		error,
	} = useSupabaseQuery(
		'user-supported-projects',
		(client) => getUserSupportedProjects(client, userId),
		{
			additionalKeyValues: [userId],
		},
	)

	const totalContributed = supportedProjects.reduce(
		(sum, p) => sum + Number(p.contributionAmount || 0),
		0,
	)
	const impactScore = supportedProjects.length * 10

	return (
		<motion.div
			variants={staggerContainer}
			initial="initial"
			animate="animate"
			className="space-y-6"
		>
			{/* Header */}
			<motion.div
				variants={cardVariants}
			>
				<h2 className="text-3xl font-extrabold text-foreground">
					Your Impact
				</h2>
				<p className="text-muted-foreground mt-1">
					Track your contributions and the projects you're supporting
				</p>
			</motion.div>

			{/* Stats Overview */}
			<motion.div
				variants={staggerContainer}
				initial="initial"
				animate="animate"
				className="grid gap-4 md:grid-cols-3"
			>
				<motion.div variants={cardVariants}>
					<Card className="border-0 overflow-hidden bg-card shadow-lg hover:shadow-xl transition-all duration-300 relative group">
						<div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
						<CardHeader className="pb-3 relative z-10">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								Projects Supported
							</CardTitle>
						</CardHeader>
						<CardContent className="relative z-10">
							<motion.div
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								transition={{ delay: 0.2, type: 'spring' }}
								className="text-4xl font-extrabold text-foreground"
							>
								{supportedProjects.length}
							</motion.div>
						</CardContent>
					</Card>
				</motion.div>
				<motion.div variants={cardVariants}>
					<Card className="border-0 overflow-hidden bg-card shadow-lg hover:shadow-xl transition-all duration-300 relative group">
						<div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
						<CardHeader className="pb-3 relative z-10">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								Total Contributed
							</CardTitle>
						</CardHeader>
						<CardContent className="relative z-10">
							<motion.div
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								transition={{ delay: 0.3, type: 'spring' }}
								className="text-4xl font-extrabold text-primary"
							>
								${totalContributed.toLocaleString()}
							</motion.div>
						</CardContent>
					</Card>
				</motion.div>
				<motion.div variants={cardVariants}>
					<Card className="border-0 overflow-hidden bg-card shadow-lg hover:shadow-xl transition-all duration-300 relative group">
						<div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
						<CardHeader className="pb-3 relative z-10">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								Impact Score
							</CardTitle>
						</CardHeader>
						<CardContent className="relative z-10">
							<motion.div
								initial={{ scale: 0, rotate: -180 }}
								animate={{ scale: 1, rotate: 0 }}
								transition={{ delay: 0.4, type: 'spring' }}
								className="text-4xl font-extrabold flex items-center gap-2"
							>
								<motion.div
									animate={{ rotate: [0, 10, -10, 0] }}
									transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
								>
									<Trophy className="h-8 w-8 text-primary" />
								</motion.div>
								<span className="text-foreground">
									{impactScore}
								</span>
							</motion.div>
						</CardContent>
					</Card>
				</motion.div>
			</motion.div>

			{/* Impact Card */}
			<motion.div
				variants={cardVariants}
				whileHover={{ y: -2 }}
			>
			<Card className="border-0 shadow-xl bg-card hover:shadow-2xl transition-all duration-300 overflow-hidden relative group">
				<div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-700" />
				<CardHeader className="relative z-10">
					<CardTitle className="text-foreground">
						Impact Overview
					</CardTitle>
					</CardHeader>
					<CardContent className="relative z-10">
						<ImpactCard />
					</CardContent>
				</Card>
			</motion.div>

			{/* Supported Projects */}
			<AnimatePresence mode="wait">
				{isLoading ? (
					<motion.div
						key="loading"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="text-center py-12 text-muted-foreground"
					>
						Loading supported projects...
					</motion.div>
				) : error ? (
					<motion.div
						key="error"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
					>
						<Card className="border-0 bg-red-50">
							<CardContent className="py-12 text-center text-red-600">
								Error loading projects. Please try again.
							</CardContent>
						</Card>
					</motion.div>
				) : supportedProjects.length > 0 ? (
					<motion.div
						key="projects"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="space-y-4"
					>
						<h3 className="text-xl font-semibold flex items-center gap-2 text-foreground">
							<motion.div
								animate={{ scale: [1, 1.2, 1] }}
								transition={{ duration: 1.5, repeat: Infinity }}
							>
								<Heart className="h-5 w-5 fill-primary text-primary" />
							</motion.div>
							Supported Projects
						</h3>
						<motion.div
							variants={staggerContainer}
							initial="initial"
							animate="animate"
							className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
						>
							{supportedProjects.map((project, index) => (
								<motion.div
									key={project.id}
									variants={cardVariants}
									custom={index}
								>
									<SupportedProjectCard project={project} />
								</motion.div>
							))}
						</motion.div>
					</motion.div>
				) : (
					<motion.div
						key="empty"
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0 }}
					>
						<Card className="border-0 bg-card">
							<CardContent className="py-12 text-center">
								<p className="text-muted-foreground mb-4">
									You haven't supported any projects yet
								</p>
								<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
									<Button 
										asChild
										className="bg-primary hover:bg-primary/90 text-primary-foreground"
									>
										<Link href="/projects">
											<Heart className="h-4 w-4 mr-2" />
											Explore Projects
										</Link>
									</Button>
								</motion.div>
					</CardContent>
				</Card>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Rewards & Achievements */}
			<motion.div
				variants={staggerContainer}
				initial="initial"
				animate="animate"
				className="grid gap-6 lg:grid-cols-2"
			>
				<motion.div variants={cardVariants}>
					<Card className="border-0 shadow-xl bg-card hover:shadow-2xl transition-all duration-300 overflow-hidden relative group">
						<div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-700" />
						<CardHeader className="relative z-10">
							<CardTitle className="flex items-center gap-2 text-foreground">
								<motion.div
									animate={{ rotate: [0, 10, -10, 0] }}
									transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
								>
									<Trophy className="h-5 w-5 text-primary" />
								</motion.div>
								Badges & Achievements
							</CardTitle>
					</CardHeader>
						<CardContent className="relative z-10">
						<AchievementsGrid />
					</CardContent>
				</Card>
				</motion.div>

				<motion.div variants={cardVariants}>
					<Card className="border-0 shadow-xl bg-card hover:shadow-2xl transition-all duration-300 overflow-hidden relative group">
						<div className="absolute top-0 left-0 w-40 h-40 bg-secondary/5 rounded-full -ml-20 -mt-20 group-hover:scale-150 transition-transform duration-700" />
						<CardHeader className="relative z-10">
							<CardTitle className="text-foreground">
								Donation History
							</CardTitle>
					</CardHeader>
						<CardContent className="relative z-10">
						<TransactionHistory />
					</CardContent>
				</Card>
				</motion.div>
			</motion.div>
		</motion.div>
	)
}

function SupportedProjectCard({
	project,
}: {
	project: {
		id: string
		title: string
		slug: string
		description: string | null
		image: string | null
		raised: number
		goal: number
		percentageComplete: number | null
		status: string
		tags: Array<{ name: string; color: string | null }>
		contributionAmount: string | number
		contributionDate: string | null
	}
}) {
	const percentage = project.percentageComplete ?? 0
	const contributionAmount = Number(project.contributionAmount)

	return (
		<motion.div
			whileHover={{ y: -8, scale: 1.02 }}
			transition={{ type: 'spring', stiffness: 300 }}
		>
			<Card className="border-0 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 h-full flex flex-col bg-card relative group">
				{/* Decorative overlay */}
				<div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-all duration-300 pointer-events-none" />
				
				{project.image && (
					<motion.div 
						className="relative h-48 w-full overflow-hidden"
						whileHover={{ scale: 1.05 }}
						transition={{ duration: 0.3 }}
					>
						<Image
							src={project.image}
							alt={project.title}
							fill
							className="object-cover"
						/>
						<div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
					</motion.div>
				)}
				<CardHeader className="relative z-10">
					<CardTitle className="text-lg line-clamp-2 font-bold">{project.title}</CardTitle>
				</CardHeader>
				<CardContent className="flex-1 flex flex-col gap-4 relative z-10">
					{project.description && (
						<p className="text-sm text-muted-foreground line-clamp-2">
							{project.description}
						</p>
					)}
					<div className="space-y-2">
						<div className="flex justify-between text-sm">
							<span className="text-muted-foreground font-medium">Your Contribution</span>
							<span className="font-bold text-primary">
								${contributionAmount.toLocaleString()}
							</span>
						</div>
						<div className="flex justify-between text-sm">
							<span className="text-muted-foreground font-medium">Total Raised</span>
							<span className="font-bold">
								${Number(project.raised).toLocaleString()} / ${Number(project.goal).toLocaleString()}
							</span>
						</div>
						<div className="relative h-3 bg-muted rounded-full overflow-hidden">
							<motion.div
								className="h-full bg-primary rounded-full"
								initial={{ width: 0 }}
								animate={{ width: `${percentage}%` }}
								transition={{ duration: 1, ease: 'easeOut' }}
							/>
						</div>
						<p className="text-xs text-muted-foreground text-right font-medium">
							{percentage.toFixed(1)}% funded
						</p>
					</div>
					{project.tags.length > 0 && (
						<div className="flex flex-wrap gap-1">
							{project.tags.slice(0, 3).map((tag) => (
								<motion.div
									key={tag.name}
									whileHover={{ scale: 1.1 }}
									whileTap={{ scale: 0.95 }}
								>
									<Badge
										variant="outline"
										className="text-xs"
										style={{
											borderColor: tag.color || undefined,
											color: tag.color || undefined,
										}}
									>
										{tag.name}
									</Badge>
								</motion.div>
							))}
		</div>
					)}
					<motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
						<Button 
							asChild 
							variant="outline" 
							className="flex-1 border-border hover:bg-muted"
						>
							<Link href={`/projects/${project.slug}`}>
								View Project
								<ArrowRight className="h-4 w-4 ml-2" />
							</Link>
						</Button>
					</motion.div>
				</CardContent>
			</Card>
		</motion.div>
	)
}
