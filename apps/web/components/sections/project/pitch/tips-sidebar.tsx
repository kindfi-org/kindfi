'use client'

import { motion } from 'framer-motion'
import {
	CircleHelp,
	type LucideIcon,
	MessageSquareText,
	Share2,
	Star,
	Users,
} from 'lucide-react'
import { Button } from '~/components/base/button'
import { Card, CardContent } from '~/components/base/card'

interface Tip {
	id: string
	title: string
	description: string
	action: string
	icon: LucideIcon
}

const tips: Tip[] = [
	{
		id: 'feedback',
		title: 'Get Pitch Feedback',
		description:
			'Share your pitch with our community experts for valuable insights.',
		action: 'Request Feedback',
		icon: MessageSquareText,
	},
	{
		id: 'teaser',
		title: 'Post a Teaser',
		description: 'Build excitement by sharing previews on social media.',
		action: 'Create Post',
		icon: Share2,
	},
	{
		id: 'vip',
		title: 'Leverage VIP Terms',
		description: 'Offer special terms to early supporters and key investors.',
		action: 'Set Terms',
		icon: Star,
	},
	{
		id: 'testimonials',
		title: 'Customer Testimonials',
		description: 'Collect and showcase testimonials from your supporters.',
		action: 'Add Testimonials',
		icon: Users,
	},
]

export default function TipsSidebar() {
	return (
		<motion.aside
			initial={{ opacity: 0, x: 20 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ duration: 0.5, delay: 0.5 }}
			className="mx-auto"
		>
			<div className="flex items-center gap-2">
				<CircleHelp className="text-gray-500" />
				<h2 className="text-xl font-bold">Tips to Maximize Your Raise</h2>
			</div>
			<div className="mt-4 space-y-4">
				{tips.map((tip, index) => (
					<motion.div
						key={tip.id}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
					>
						<Card className="p-4 shadow-md border-none">
							<CardContent className="flex items-center gap-4">
								<div className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-300">
									<tip.icon className="w-6 h-6" />
								</div>
								<div className="flex-1">
									<h3 className="text-lg font-semibold">{tip.title}</h3>
									<p className="text-gray-600 font-medium">{tip.description}</p>
									<Button variant="link" size="sm" className="px-0">
										{tip.action}
									</Button>
								</div>
							</CardContent>
						</Card>
					</motion.div>
				))}
			</div>
		</motion.aside>
	)
}
