import { Rocket, Shield, TrendingUp, Users } from 'lucide-react'
import type { Benefit, TestimonialData } from '~/lib/types'

export const benefits: Benefit[] = [
	{
		id: 'community-social-impact',
		icon: <Users className="w-5 h-5" />,
		text: 'Community-Powered Social Impact',
	},
	{
		id: 'empowering-crypto-supporters',
		icon: <TrendingUp className="w-5 h-5" />,
		text: 'Empowering Crypto Contributors',
	},
	{
		id: 'blockchain-verification',
		icon: <Shield className="w-5 h-5" />,
		text: 'Trustless Verification & Transparency',
	},
	{
		id: 'accelerating-blockchain-adoption',
		icon: <Rocket className="w-5 h-5" />,
		text: 'Accelerating Blockchain for Good',
	},
]

export const testimonialData: TestimonialData = {
	quote: [
		'KindFi transforms every supporter into an ambassador for change. It goes beyond traditional giving empowering you with real visibility, real voice, and real impact. In this community, your contributions don’t just support causes. They shape the future of how good gets done.',
	].join(''),
	author: 'KindFi',
	role: 'Social Impact Platform, Powered by Stellar',
	imageUrl: '/placeholder-image.jpg',
}
