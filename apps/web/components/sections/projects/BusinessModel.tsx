'use client'

import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

export interface MarketCard {
	title: string
	description: string
	icon: LucideIcon
	iconBgColor: string
	color: string
}

export interface BusinessModelProps {
	title: string
	description: string
	markets: MarketCard[]
}

export default function BusinessModel({
	title,
	description,
	markets,
}: BusinessModelProps) {
	return (
		<div className="max-w-4xl mx-auto">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
			>
				<h1 className="text-3xl font-bold mb-4">{title}</h1>

				<p className="text-lg mb-8">{description}</p>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{markets.map((market, index) => {
						const Icon = market.icon

						return (
							<motion.div
								key={market.title}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.3, delay: index * 0.1 }}
								className="bg-muted p-6 rounded-lg"
							>
								<div className="flex items-start gap-4">
									<div
										className={`${market.iconBgColor} ${market.color} p-3 rounded-full`}
									>
										<Icon className="h-6 w-6" />
									</div>
									<div>
										<h3 className="text-xl font-semibold mb-2">
											{market.title}
										</h3>
										<p className="text-muted-foreground">
											{market.description}
										</p>
									</div>
								</div>
							</motion.div>
						)
					})}
				</div>
			</motion.div>
		</div>
	)
}
