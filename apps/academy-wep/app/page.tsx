'use client'

import { motion } from 'framer-motion'
import { ArrowRight, DiscIcon as Discord, Github, Twitter } from 'lucide-react'
import { useState } from 'react'
import { CommunitySection } from '~/components/CommunitySection'
import { Button } from '~/components/base/button'
import { Input } from '~/components/base/input'
import ReadyToEarn from '~/components/ready-to-earn'
import { WhyChoose } from '~/components/sections/why-choose'

export default function Home() {
	const [email, setEmail] = useState('')

	// Calculate time until launch
	const launchDate = new Date('2025-06-01').getTime()
	const now = new Date().getTime()
	const distance = launchDate - now
	const days = Math.floor(distance / (1000 * 60 * 60 * 24))

	return (
		<main className="min-h-screen relative overflow-hidden text-foreground">
			{/* Background gradient */}
			{/* Floating elements */}
			<div className="absolute inset-0 overflow-hidden">
				{[...Array(3)].map((_, i) => {
					// Use fixed positions instead of random values
					const positions = [
						{ left: '39.44%', top: '31.45%' },
						{ left: '43.76%', top: '90.23%' },
						{ left: '84.08%', top: '40.18%' },
					]

					return (
						<motion.div
							// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
							key={i}
							className="absolute w-[250px] h-[250px] rounded-full bg-primary-400/10 blur-3xl"
							style={positions[i]}
							animate={{
								x: [0, 100, 0],
								y: [0, 50, 0],
								scale: [1, 1.2, 1],
							}}
							transition={{
								duration: 14,
								repeat: Number.POSITIVE_INFINITY,
								ease: 'easeInOut',
								delay: i * 2,
							}}
						/>
					)
				})}
			</div>

			<div className="relative z-10 container mx-auto px-4 py-24 flex flex-col items-center justify-center min-h-screen gap-10">
				{/* Countdown */}
				<motion.div
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="inline-block px-4 py-1.5 border border-primary-500 text-primary-300 rounded-full"
				>
					{days} days until launch
				</motion.div>

				{/* Title */}
				<motion.h1
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.7 }}
					className="text-5xl md:text-7xl font-extrabold tracking-tight text-center leading-tight"
				>
					Welcome to{' '}
					<span className="bg-gradient-to-r from-primary-400 to-green-600 text-transparent bg-clip-text">
						KindFi Academy
					</span>
				</motion.h1>

				{/* Subtitle */}
				<motion.p
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.9 }}
					className="text-lg md:text-2xl text-muted-foreground max-w-2xl text-center"
				>
					Master blockchain fundamentals and unlock the power of Web3 for social
					impact.
				</motion.p>
				{/* Ready to earn more badges */}
				<motion.div
					initial={{ x: -100, opacity: 0 }}
					animate={{ x: 0, opacity: 1 }}
					exit={{ x: 100, opacity: 0 }}
					transition={{ duration: 0.6, ease: 'easeInOut' }}
				>
					<ReadyToEarn
						badges={[
							{ id: '1', name: 'Blockchain Basics', earned: true },
							{ id: '2', name: 'Stellar Expert', earned: false },
							{ id: '3', name: 'Wallet Master', earned: false },
							{ id: '4', name: 'Asset Manager', earned: false },
							{ id: '5', name: 'Web3 Pioneer', earned: false },
							{ id: '6', name: 'KindFi Graduate', earned: false },
						]}
					/>
				</motion.div>
				<CommunitySection memberCount="500+" />
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1 }}
					className="max-w-md w-full"
				>
					<div className="flex gap-3">
						<Input
							type="email"
							placeholder="Enter your email"
							className="bg-background border border-border text-foreground placeholder-muted-foreground focus:ring-primary-500 rounded-md"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>
						<Button className="bg-primary-600 hover:bg-primary-700 transition-all rounded-md shadow-lg hover:shadow-xl">
							Join Now <ArrowRight className="ml-2 h-5 w-5" />
						</Button>
					</div>
					<p className="text-sm text-muted-foreground mt-2 text-center">
						Be the first to know when we launch.
					</p>
				</motion.div>

				{/* Social Links */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 1.2 }}
					className="flex gap-6 mt-6"
				>
					{[
						{ icon: Discord, label: 'Discord', link: '#' },
						{ icon: Twitter, label: 'Twitter', link: '#' },
						{ icon: Github, label: 'Github', link: '#' },
					].map((social, i) => (
						<a
							// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
							key={i}
							href={social.link}
							target="_blank"
							rel="noopener noreferrer"
						>
							<Button
								variant="ghost"
								size="icon"
								className="text-muted-foreground hover:text-primary-400 hover:bg-muted transition-all rounded-md"
							>
								<social.icon className="h-6 w-6" />
								<span className="sr-only">{social.label}</span>
							</Button>
						</a>
					))}
				</motion.div>
			</div>
			<WhyChoose />
		</main>
	)
}
