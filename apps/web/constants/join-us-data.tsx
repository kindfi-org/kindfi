import { motion } from 'framer-motion'
import { ArrowUpRight, Megaphone, RefreshCw } from 'lucide-react'
import type { Feature } from '~/lib/types'

const ANIMATION_DURATION = 20

export const features: Feature[] = [
	{
		id: 'collaborate-and-earn-rewards-id',
		icon: (
			<div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center relative overflow-hidden group-hover:bg-teal-100 transition-colors duration-300">
				<motion.div
					initial={{ rotate: 0 }}
					animate={{ rotate: 360 }}
					transition={{
						duration: ANIMATION_DURATION,
						repeat: Number.POSITIVE_INFINITY,
						ease: 'linear',
					}}
					className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(20,184,166,0.1),transparent)]"
				/>
				<ArrowUpRight className="w-8 h-8 text-teal-600 relative z-10" />
			</div>
		),
		title: 'Give With Purpose, Earn With Impact',
		description:
			'Support verified projects, grow your Kinders NFT, and unlock governance rights, exclusive campaigns, and rewards. Every donation contributes to your on-chain identity and moves the ecosystem forward.',
		highlight: 'Reputation System',
	},
	{
		id: 'build-a-better-world-id',
		icon: (
			<div className="w-16 h-16 rounded-full bg-sky-50 flex items-center justify-center relative overflow-hidden group-hover:bg-sky-100 transition-colors duration-300">
				<motion.div
					initial={{ rotate: 0 }}
					animate={{ rotate: -360 }}
					transition={{
						duration: ANIMATION_DURATION,
						repeat: Number.POSITIVE_INFINITY,
						ease: 'linear',
					}}
					className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(14,165,233,0.1),transparent)]"
				/>
				<RefreshCw className="w-8 h-8 text-sky-600 relative z-10" />
			</div>
		),
		title: 'Fuel the Causes That Matter Most',
		description:
			'Discover social, environmental, and humanitarian projects from across LATAM and beyond. All campaigns are milestone-verified and built on trustless fund release, ensuring your impact is real and trackable.',
		highlight: 'View Verified Projects',
	},
	{
		id: 'be-the-revolution-id',
		icon: (
			<div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center relative overflow-hidden group-hover:bg-purple-100 transition-colors duration-300">
				<motion.div
					initial={{ rotate: 0 }}
					animate={{ rotate: 360 }}
					transition={{
						duration: ANIMATION_DURATION,
						repeat: Number.POSITIVE_INFINITY,
						ease: 'linear',
					}}
					className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(89, 16, 185, 0.1),transparent)]"
				/>
				<Megaphone className="w-8 h-8 text-purple-600 relative z-10" />
			</div>
		),
		title: 'Become a Steward of Change',
		description:
			"With KindFi, supporters aren't just donors — they're governors. Your on-chain activity earns you the right to help shape how community funds are allocated, and what causes rise next.",
		highlight: 'Learn About Kinders NFTs',
	},
]
