'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { Card, CardContent } from '~/components/base/card'
import {
	cardVariants,
	fadeInUp,
	staggerChildren,
} from '~/lib/constants/animations'
import { statsData } from '~/lib/constants/impact-data/hero-data'
import type { StatCard } from '~/lib/types/impact/hero'

export function Hero() {
	const shouldReduceMotion = useReducedMotion()

	const renderStatCard = ({ id, value, label }: StatCard) => (
		<motion.div
			key={id}
			variants={shouldReduceMotion ? {} : cardVariants}
			whileHover="hover"
		>
			<Card className="overflow-hidden shadow-xl border-none bg-white rounded-xl">
				<CardContent className="p-7 sm:p-3">
					<div className="space-y-3">
						<h3 className="md:text-3xl text-lg font-bold">{value}</h3>
						<p className="md:text-sm text-xs text-muted-foreground">{label}</p>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	)

	return (
		<section className="container mx-auto px-4 py-32 text-center">
			<div className="space-y-10">
				<motion.span
					className="inline-flex rounded-full border border-gray-300  px-3 py-1 text-sm font-bold"
					variants={fadeInUp}
					initial="initial"
					animate="animate"
				>
					Transparency in Action
				</motion.span>

				<div className="space-y-7">
					<div className="flex justify-center">
						<motion.h1
							className="text-4xl font-bold tracking-tight sm:text-5xl md:text-5xl md:leading-[1.25] w-1/2 text-center"
							variants={fadeInUp}
							initial="initial"
							animate="animate"
						>
							Real Change, Real Results
							<br />
							Powered by Blockchain
							<br />
							Transparency
						</motion.h1>
					</div>

					<motion.p
						className="mx-auto max-w-2xl text-lg text-muted-foreground font-semibold"
						variants={fadeInUp}
						initial="initial"
						animate="animate"
					>
						See the social impact of KindFi campaigns, fully tracked and
						verifiable on the Stellar blockchain.
					</motion.p>
				</div>

				<motion.div
					className="grid gap-8 sm:grid-cols-3 justify-center mx-auto max-w-[700px]"
					variants={staggerChildren}
					initial="initial"
					animate="animate"
				>
					{statsData.map(renderStatCard)}
				</motion.div>
			</div>
		</section>
	)
}
