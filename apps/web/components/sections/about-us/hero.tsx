'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '~/components/base/button'

export function Hero() {
	return (
		<section
			className="relative z-0 min-h-[60vh] px-4 pt-20"
			aria-labelledby="hero-title"
			role="banner"
		>
			<div className="container mx-auto max-w-6xl">
				<div className="text-center">
					<motion.h2
						className="text-2xl font-bold mb-6"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
					>
						Reimagining Social Impact
					</motion.h2>

					<motion.h1
						className="text-4xl md:text-5xl font-bold gradient-text mb-8 py-4"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.2 }}
					>
						Redefining Crowdfunding with Blockchain Transparency
					</motion.h1>

					<motion.p
						className="text-lg text-gray-700 pt-2 my-6"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.4 }}
					>
						KindFi is the first Web3 platform built to fund verified social
						impact using Stellar blockchain, smart contract escrows, and
						AI-powered verification. We make it possible to support or launch
						trusted causes—securely, transparently, and on-chain
					</motion.p>

					<motion.div
						className="flex flex-col sm:flex-row gap-4 justify-center"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.6 }}
					>
						<a
							href="https://www.youtube.com/watch?v=Hlh4R8u-lWU"
							target="_blank"
							rel="noopener noreferrer"
						>
							<Button size="lg" className="gradient-btn text-white">
								See how it works in minutes
							</Button>
						</a>
						<Link href="/projects">
							<Button
								size="lg"
								variant="outline"
								className="gradient-border-btn"
							>
								Discover causes or launch yours
							</Button>
						</Link>
					</motion.div>
				</div>
			</div>
		</section>
	)
}
