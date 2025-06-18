import type { FeatureCardData } from '@/types/impact.types'
import { CheckCircle, Shield, TrendingUp } from 'lucide-react-native'

export const featureCardsData: FeatureCardData[] = [
	{
		id: '1',
		icon: CheckCircle,
		title: 'Every Contribution, Recorded On-Chain',
		description: 'Complete transparency with immutable transaction records',
		stat: '$1.7B in regional funding tracked annually',
		iconColor: 'success-600',
		backgroundColor: 'bg-green-100',
	},
	{
		id: '2',
		icon: Shield,
		title: 'Every Project, Fully Reviewed',
		description: 'Rigorous vetting process ensures legitimate impact projects',
		stat: '100% of campaigns undergo milestone verification',
		iconColor: 'blue-600',
		backgroundColor: 'bg-blue-100',
	},
	{
		id: '3',
		icon: TrendingUp,
		title: 'From Crypto to Real Change',
		description: 'Transforming digital contributions into measurable impact',
		bulletPoints: [
			'Real-Time Impact Metrics',
			'Proof-backed fund releases',
			'Transparent governance',
			'Built on Stellar smart contracts',
		],
		iconColor: 'orange-600',
		backgroundColor: 'bg-orange-100',
	},
]
