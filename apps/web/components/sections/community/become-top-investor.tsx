'use client'

import { motion } from 'framer-motion'
import { GraduationCap, Heart } from 'lucide-react'
import { Button } from '~/components/base/button'

export function BecomeInvestor() {
	return (
		<section className="py-36">
			<div className="container">
				<div className="mx-auto max-w-3xl text-center">
					<motion.h2
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
						viewport={{ once: true }}
						className="mb-6 text-4xl font-bold sm:text-5xl"
					>
						Become a Top kindlers
					</motion.h2>

					<motion.p
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.1 }}
						viewport={{ once: true }}
						className="mb-12 text-lg text-gray-600 sm:text-xl"
					>
						Join our community of impact-driven kindlerss and help shape the
						future of social change through transparent, blockchain-verified
						crowdfunding.
					</motion.p>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.2 }}
						viewport={{ once: true }}
						className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
					>
						<Button
							size="lg"
							className="h-14 min-w-[200px] rounded-xl bg-black hover:bg-black/80 text-white"
						>
							<Heart className="mr-2 h-5 w-5" />
							Start Supporting Projects
						</Button>
						<Button
							variant="outline"
							size="lg"
							className="h-14 min-w-[200px] rounded-xl border-gray-300 text-black hover:text-[#309232]"
						>
							<GraduationCap className="mr-2 h-5 w-5" />
							Learn More
						</Button>
					</motion.div>
				</div>
			</div>
		</section>
	)
}
