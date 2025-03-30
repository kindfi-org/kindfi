import { motion } from 'framer-motion'
import { CTAButtons } from './CTAButtons'
import { CommunityStats } from './CommunityStats'

interface CommunitySectionProps {
  /** Number of community members to display (e.g. "500+") */
  memberCount?: string;
  /** Callback function for workshop button click */
  onWorkshopClick?: () => void;
  /** Callback function for subscribe button click */
  onSubscribeClick?: () => void;
  /** Main heading text for the community section */
  title?: string;
  /** Description paragraph for the community section */
  description?: string;
  /** Text displayed in the badge above the title */
  badgeText?: string;
}

export function CommunitySection({
	memberCount = '500+',
	onWorkshopClick,
	onSubscribeClick,
	title = 'Learn Together, Build Together',
	description = 'Stay updated with the latest resources, tutorials, and insights about Web3 crowdfunding. Join our community of builders and changemakers.',
	badgeText = 'Join Our Community',
}: CommunitySectionProps) {
	return (
		<section className="py-24 relative overflow-hidden">
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
								{badgeText}
							</div>
							<h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-gray-800 to-[#7CC635] bg-clip-text text-transparent">
								{title}
							</h2>
							<p className="text-lg text-gray-600 mb-8">{description}</p>

							<CTAButtons
								onWorkshopClick={onWorkshopClick}
								onSubscribeClick={onSubscribeClick}
							/>
						</div>

						<div className="md:block">
							<CommunityStats memberCount={memberCount} />
						</div>
					</div>
				</motion.div>
			</div>
		</section>
	)
}
