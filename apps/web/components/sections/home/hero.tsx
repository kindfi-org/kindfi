'use client'

import { motion } from 'framer-motion'

import Link from 'next/link'
import { Button } from '~/components/base/button'
import { Categories } from './category-badge'

export function Hero() {
	return (
		<section
			className="relative z-0 min-h-[80vh] bg-gradient-to-b from-purple-50/50 to-white px-4 pt-20"
			aria-labelledby="hero-title"
			role="banner"
		>
			<div className="container mx-auto max-w-6xl">
				<div className="text-center">
					<motion.h2
						className="text-2xl font-bold text-gray-800 mb-6"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
					>
						Support What Matters
					</motion.h2>

					<motion.h1
						className="text-4xl md:text-5xl font-bold gradient-text mb-8 py-4"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.2 }}
					>
						Where Blockchain Meets Real-World Impact
					</motion.h1>

					<motion.p
						className="text-lg text-gray-700 pt-2 my-6"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.4 }}
					>
						KindFi empowers people to support trusted causes around the world
						using the power of stellar blockchain. Every contribution goes
						further with built-in transparency, verified impact, and a community
						that believes giving should be easy, smart, secure, and meaningful
					</motion.p>

					<motion.div
						className="flex flex-col sm:flex-row gap-4 justify-center"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.6 }}
					>
						<Link href="/projects">
							<Button size="lg" className="gradient-btn text-white">
								Support with Crypto
							</Button>
						</Link>
						<Link href="/projects">
							<Button
								size="lg"
								variant="outline"
								className="gradient-border-btn"
							>
								Explore Causes
							</Button>
						</Link>
					</motion.div>
					<Categories className="mt-6" />
				</div>
			</div>
		</section>
	)
}
