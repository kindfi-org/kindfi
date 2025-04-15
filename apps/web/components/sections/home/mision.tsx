'use client'

import { motion } from 'framer-motion'
import { CTAButtons } from '~/components/shared/cta-buttons'

export const KindfiMission = () => {
	return (
		<div className="relative py-16 px-4 overflow-hidden">
			{/* Enhanced gradient background with subtle animation */}
			<motion.div
				className="absolute inset-0 bg-gradient-to-r from-blue-50 via-sky-50 to-teal-50"
				initial={{ opacity: 0 }}
				animate={{ opacity: 0.6 }}
				transition={{ duration: 1.5 }}
			/>

			{/* Pattern overlay for added visual interest */}
			<div className="absolute inset-0 bg-grid-pattern opacity-10" />

			<motion.aside
				className="relative max-w-3xl mx-auto rounded-2xl p-8 sm:p-10 bg-white/70 backdrop-blur-sm shadow-sm"
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8 }}
			>
				<div className="relative">
					<motion.h4
						className="text-2xl font-semibold text-center text-gray-900 mb-6"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.6, delay: 0.2 }}
					>
						KindFi: One Wallet. One Blockchain. One World. Real Change.
					</motion.h4>

					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.6, delay: 0.4 }}
					>
						<p className="text-gray-700 mb-6 leading-relaxed text-center sm:text-left">
							At KindFi, we're building more than a platform — we're building a
							movement. Powered by the Stellar blockchain, KindFi turns a single
							wallet into a gateway for global impact.
						</p>

						<p className="text-gray-700 mb-8 leading-relaxed text-center sm:text-left">
							From clean water to children education and animal rescue, every
							verified campaign is fueled by real people, transparent tech, and
							milestone-based trust. Join us as we prove that one contribution,
							made securely and transparently, can change lives.
							<span className="block mt-4 font-medium text-teal-700">
								This is social impact reimagined — where every wallet is a voice
								for good.
							</span>
						</p>
					</motion.div>

					<CTAButtons
						primaryText="Join the Change"
						secondaryText="Discover more about KindFi"
						primaryHref="/create-account"
						secondaryHref="/about"
						className="mt-8"
						animationDelay={0.6}
					/>
				</div>
			</motion.aside>
		</div>
	)
}
