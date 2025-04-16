import type { HeroInvestor } from '~/lib/types/investors/hero.types'

export const investorsData: HeroInvestor[] = [
	{
		id: 1,
		name: 'Sarah Chen',
		profileImg:
			'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-RbfLkmuRaFlizyEVP4f5bGBEEnX3f6.png',
		badge: 'Investor of the Month',
		level: 'Platinum Impact Investor',
		stats: [
			{ label: 'Total Impact', value: '$250,000' },
			{ label: 'Projects', value: '45' },
			{ label: 'Followers', value: '1,200' },
			{ label: 'Recent Project', value: '$50,000' },
		],
		tags: [
			{ icon: 'Leaf', label: 'Environment' },
			{ icon: 'GraduationCap', label: 'Education' },
		],
	},
]
