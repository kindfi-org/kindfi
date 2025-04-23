import { ChartBar, Clock, ShieldCheck, Target, Wallet } from 'lucide-react'
import type { Feature, Stat } from '~/lib/types'

export const features: Feature[] = [
	{
		id: 'transparency-powered-by-web3-id',
		title: 'Every Contribution, Recorded On-Chain',
		description:
			'Each donation is tracked on the Stellar blockchain with real-time visibility. You always know how and where your support is being used with no middlemen and no blind spots.',
		icon: <Wallet className="w-6 h-6 text-purple-600" />,
		stats: {
			value: '$1.7B',
			label:
				'in regional funding now ready to be unlocked with blockchain transparency',
		},
	},
	{
		id: 'decentralized-verification-id',
		title: 'Every Project, Fully Reviewed',
		description:
			'Our team carefully reviews and approves every campaign to ensure feasibility, safety, and alignment with social impact goals. Escrows ensure that no funds are released without verified milestones.',
		icon: <ShieldCheck className="w-6 h-6 text-blue-600" />,
		stats: {
			value: '100%',
			label: 'of campaigns undergo full milestone validation',
		},
	},
	{
		id: 'measurable-social-impact-id',
		title: 'From Crypto to Real Change',
		description:
			'Smart contracts release funds in tranches as projects reach their goals turning crypto into tangible results. Track every milestone, impact update, and decision in one place.',
		icon: <Target className="w-6 h-6 text-purple-600" />,
		checkList: [
			{ id: 'metrics', text: 'Real-Time Impact Metrics' },
			{ id: 'escrows', text: 'Proof-backed fund releases' },
			{ id: 'governance', text: 'Transparent governance' },
			{ id: 'blockchain', text: 'Built on Stellar smart contracts' },
		],
	},
]

export const stats: Stat[] = [
	{
		id: 'verified-projects-id',
		value: '100%',
		label: 'Verified Projects',
		icon: <ShieldCheck className="w-6 h-6 text-blue-600" />,
	},
	{
		id: 'transparency-id',
		value: '0%',
		label: 'Hidden Fees',
		icon: <ChartBar className="w-6 h-6 text-blue-600" />,
	},
	{
		id: 'information-availability-id',
		value: '24/7',
		label: 'Project Transparency',
		icon: <Clock className="w-6 h-6 text-blue-600" />,
	},
]
