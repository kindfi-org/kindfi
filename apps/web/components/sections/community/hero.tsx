'use client'

import { motion } from 'framer-motion'
import { BadgeCheck, Crown, GraduationCap, Leaf } from 'lucide-react'
import { Badge } from '~/components/base/badge'
import { Card, CardContent } from '~/components/base/card'
import { fadeInUp, staggerChildren } from '~/lib/constants/animations'
import { investorsData } from '~/lib/mock-data/community-hero-data'
import type { HeroInvestor } from '~/lib/types/investors/hero.types'

const iconMap = {
	Leaf,
	GraduationCap,
}

export function Hero() {
	return (
		<div className="min-h-screen bg-gray-50 py-32 px-4 sm:px-6 lg:px-8">
			<div className="max-w-4xl mx-auto">
				<div className="space-y-10">
					<div className="flex justify-center">
						<motion.span
							className="inline-flex rounded-full border border-gray-300 px-3 py-1 text-sm font-bold"
							variants={fadeInUp}
							initial="initial"
							animate="animate"
						>
							Investor Recognition
						</motion.span>
					</div>

					<div className="space-y-7 text-center">
						<motion.h1
							className="text-4xl font-bold tracking-tight sm:text-5xl md:text-5xl md:leading-[1.25]"
							variants={fadeInUp}
						>
							Recognizing the Investors
							<br />
							Driving Social Change
						</motion.h1>
						<motion.p
							className="mx-auto max-w-2xl text-lg text-muted-foreground font-semibold"
							variants={fadeInUp}
						>
							Meet the top contributors who are shaping the future of
							impact-driven crowdfunding.
						</motion.p>
					</div>

					{investorsData.map((investor) => (
						<InvestorCard key={investor.id} investor={investor} />
					))}
				</div>
			</div>
		</div>
	)
}

function InvestorCard({ investor }: { investor: HeroInvestor }) {
	return (
		<motion.div variants={staggerChildren} initial="initial" animate="animate">
			<Card className="w-full bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_1px_3px_-1px_rgba(0,0,0,0.08)] border-none">
				<CardContent className="p-6">
					<div className="flex items-start gap-6">
						<motion.div
							className="relative"
							whileHover={{ scale: 1.05 }}
							transition={{ duration: 0.2 }}
						>
							<div className="w-24 h-24 rounded-lg bg-gray-200 overflow-hidden">
								<img
									src={investor.profileImg || '/placeholder.svg'}
									alt={investor.name}
									className="w-full h-full object-cover"
								/>
							</div>
						</motion.div>

						<div className="flex-1">
							<div className="flex items-center justify-between mb-4">
								<div className="flex items-center gap-2">
									<h2 className="text-2xl font-bold">{investor.name}</h2>
									<BadgeCheck className="h-5 w-5 text-black-500" />
								</div>
								<Badge className="flex items-center gap-1 bg-gray-950 hover:bg-gray-300">
									<Crown className="h-4 w-4" />
									{investor.badge}
								</Badge>
							</div>

							<Badge className="mb-6 bg-gray-400 hover:bg-gray-400">
								{investor.level}
							</Badge>

							<motion.div
								className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6"
								variants={staggerChildren}
							>
								{investor.stats.map((stat) => (
									<motion.div key={stat.label} variants={fadeInUp}>
										<p className="text-sm text-muted-foreground">
											{stat.label}
										</p>
										<p className="text-xl font-bold">{stat.value}</p>
									</motion.div>
								))}
							</motion.div>

							<motion.div className="flex gap-2" variants={fadeInUp}>
								{investor.tags.map((tag) => {
									const Icon = iconMap[tag.icon as keyof typeof iconMap]
									return (
										<motion.div
											key={tag.label}
											whileHover={{ scale: 1.05 }}
											transition={{ duration: 0.2 }}
										>
											<Badge
												variant="secondary"
												className="bg-gray-300 hover:bg-gray-400 text-black font-bold flex items-center gap-2"
											>
												<Icon className="w-5 h-5" />
												{tag.label}
											</Badge>
										</motion.div>
									)
								})}
							</motion.div>
						</div>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	)
}
