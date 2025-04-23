import { Globe, Shield, Users } from 'lucide-react'
import { type Model, ModelVariant } from '~/lib/types'

export const models: Model[] = [
	{
		id: `model-${ModelVariant.SECURE}`,
		title: 'Milestone-Based Escrow',
		description:
			'Donations are held in Stellar smart contract escrows and released only when causes meet verified milestones. It is giving, with built-in accountability — no guesswork, no misuse.',
		variant: ModelVariant.SECURE,
		icon: <Shield className="w-6 h-6 mb-4 text-emerald-600" />,
		capabilities: [
			{ id: 'smart-contracts-id', text: 'Verified Milestone Reviews' },
			{ id: 'secure-fund-custody-id', text: 'Fund Safety Through Escrow' },
			{ id: 'blockchain-transparency-id', text: 'On-Chain Transparency' },
		],
	},
	{
		id: `model-${ModelVariant.SOCIAL}`,
		title: 'Measurable Results',
		description:
			'Every project shares updates, proof, and progress reports. Contributors see how funds are used, ensuring every act of kindness becomes lasting change.',
		variant: ModelVariant.SOCIAL,
		icon: <Users className="w-6 h-6 mb-4 text-blue-600" />,
		capabilities: [
			{ id: 'impact-reports-id', text: 'Impact Documentation' },
			{ id: 'real-time-tracking-id', text: 'Real-Time Progress Tracking' },
			{ id: 'engaged-communities-id', text: 'Transparent Community Stories' },
		],
	},
	{
		id: `model-${ModelVariant.BLOCKCHAIN}`,
		title: 'Built on Stellar. Made for Good.',
		description:
			'Connect your wallet, contribute in seconds, and earn on-chain recognition through Kinders NFTs. Every action is recorded, rewarded, and visible forever.',
		variant: ModelVariant.BLOCKCHAIN,
		icon: <Globe className="w-6 h-6 mb-4 text-teal-600" />,
		capabilities: [
			{ id: 'instant-transactions-id', text: 'Fast, Low-Cost Transactions' },
			{ id: 'immutable-records-id', text: 'Immutable Contribution Records' },
			{
				id: 'nft-certificates-tokens-id',
				text: 'NFT-Based Rewards and Identity',
			},
		],
	},
]
