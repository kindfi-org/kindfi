'use client'

import { useSupabaseQuery } from '@packages/lib/hooks'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '~/components/base/button'
import { CategoryBadge } from '~/components/sections/projects/category-badge'
import { getAllCategories } from '~/lib/queries/projects'
import { CategoryBadgeSkeleton } from '../projects/category-badge-skeleton'

export function Hero() {
	const router = useRouter()

	const {
		data: categories = [],
		isLoading,
		error,
	} = useSupabaseQuery('categories', getAllCategories, {
		staleTime: 1000 * 60 * 60, // 1 hour
		gcTime: 1000 * 60 * 60, // 1 hour
	})

	return (
		<section
			className="relative z-0 min-h-[80vh] bg-gradient-to-b from-purple-50/50 to-white px-4 pt-20 pb-8"
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
					<div className="mt-8 flex flex-wrap justify-center gap-2">
						{isLoading ? (
							<div className="flex flex-wrap gap-2">
								{Array.from({ length: 12 }).map((_, i) => (
									// biome-ignore lint/suspicious/noArrayIndexKey: using index as key is acceptable here
									<CategoryBadgeSkeleton key={i} />
								))}
							</div>
						) : error ? (
							<p className="text-sm text-destructive text-center w-full">
								Failed to load categories. Please try again later.
							</p>
						) : (
							categories.map((category) => (
								<CategoryBadge
									key={category.id}
									category={category}
									onClick={() => {
										if (!category.slug) return
										router.push(
											`/projects?category=${encodeURIComponent(category.slug)}`,
										)
									}}
								/>
							))
						)}
					</div>
				</div>
			</div>
		</section>
	)
}
