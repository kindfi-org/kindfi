import { motion } from 'framer-motion'
import { CTAButtons } from './CTAButtons'
import { CommunityStats } from './CommunityStats'

interface CommunitySectionProps {
	memberCount?: string
	onWorkshopClick?: () => void
	onSubscribeClick?: () => void
}

export function CommunitySection({
	memberCount = '500+',
	onWorkshopClick,
	onSubscribeClick,
}: CommunitySectionProps) {
	return (
		<section className="py-24 relative overflow-hidden">
			<div className="absolute inset-0 bg-gradient-to-b from-white to-gray-50/80"></div>
			<div className="absolute -top-40 right-20 w-96 h-96 bg-gradient-to-br from-[#7CC635]/10 to-transparent rounded-full blur-3xl"></div>
			<div className="absolute bottom-0 -left-20 w-80 h-80 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-full blur-3xl"></div>

			<div className="container px-4 md:px-6 mx-auto relative z-10">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
					className="max-w-4xl mx-auto bg-white/70 backdrop-blur-md rounded-3xl border border-white/20 shadow-xl p-8 md:p-12"
				>
					<div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
						<div className="flex-1 text-center md:text-left">
							<div className="inline-block mb-4 px-3 py-1 bg-[#f0f9e8] text-[#7CC635] rounded-full text-sm font-medium">
								Join Our Community
							</div>
							<h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-gray-800 to-[#7CC635] bg-clip-text text-transparent">
								Learn Together, Build Together
							</h2>
							<p className="text-lg text-gray-600 mb-8">
								Stay updated with the latest resources, tutorials, and insights
								about Web3 crowdfunding. Join our community of builders and
								changemakers.
							</p>

							<CTAButtons
								onWorkshopClick={onWorkshopClick}
								onSubscribeClick={onSubscribeClick}
							/>
						</div>

						<div className="hidden md:block">
							<CommunityStats memberCount={memberCount} />
						</div>
					</div>
				</motion.div>
			</div>
		</section>
	)
}
