'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Heart } from 'lucide-react'
import { Button } from '~/components/base/button'

export function MakeImpact() {
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
						Make Your Impact
					</motion.h2>

					<motion.p
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.1 }}
						viewport={{ once: true }}
						className="mb-12 text-lg text-gray-600 sm:text-xl"
					>
						Join thousands of others in creating meaningful change through
						transparent, blockchain-verified crowdfunding.
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
							className="h-14 min-w-[200px] rounded-xl bg-black  hover:bg-black/80 text-white"
						>
							Start a Campaign
							<ArrowRight className="ml-2 h-5 w-5" />
						</Button>
						<Button
							variant="outline"
							size="lg"
							className="h-14 min-w-[200px] rounded-xl text-black hover:text-[#309232]"
						>
							<Heart className="mr-2 h-5 w-5" />
							Support a Cause
						</Button>
					</motion.div>
				</div>
			</div>
		</section>
	)
}
