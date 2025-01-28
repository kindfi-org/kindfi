import type { ShowcaseContent } from './types'

export const showcaseContent: ShowcaseContent = {
	title: {
		main: 'The Web3 Platform Transforming',
		highlight: 'Social Impact in Latin America',
	},
	description:
		'Connect your wallet and join verified social projects. We leverage Escrow Blockchain Technology to ensure complete transparency and traceability, guaranteeing that every contribution shapes the future of our society.',
	features: [
		{
			id: 'transparency-powered-by-web3-id',
			title: 'Transparency Powered by Web3',
			description:
				'Every contribution is recorded on the blockchain, providing real-time reports so you always know how and where the funds are being used.',
			icon: 'Wallet',
			stats: {
				value: '$720K+',
				label: 'USD has helped Social Causes',
			},
		},
		{
			id: 'decentralized-verification-id',
			title: 'Decentralized Verification',
			description:
				'Each project is carefully reviewed and approved by our team to ensure feasibility, security, and alignment with social impact goals. By leveraging the power of decentralization, we provide unmatched transparency and trust.',
			icon: 'ShieldCheck',
			stats: {
				value: '100%',
				label: 'Verified Projects',
			},
		},
		{
			id: 'measurable-social-impact-id',
			title: 'Measurable Social Impact',
			description:
				'Track the tangible impact of every project with full transparency, ensuring your contributions drive meaningful change.',
			icon: 'Target',
			checkList: [
				{ id: 'metrics', text: 'Real-Time Impact Metrics' },
				{ id: 'escrows', text: 'Social Impact Through Smart Escrows' },
				{ id: 'governance', text: 'Transparent Governance' },
				{ id: 'blockchain', text: 'Blockchain-Powered Assurance' },
			],
		},
	],
	bottomInfo: {
		text: 'Using the power of Web3 technology, each project becomes an opportunity to create measurable social change. Smart escrow system powered by: ',
		link: {
			text: 'Trustless Work',
			url: 'https://www.trustlesswork.com/',
		},
	},
	stats: [
		{
			id: 'verified-projects-id',
			value: '100%',
			label: 'Verified Projects',
			icon: 'ShieldCheck',
		},
		{
			id: 'transparency-id',
			value: '0%',
			label: 'Hidden Fees',
			icon: 'ChartBar',
		},
		{
			id: 'information-availability-id',
			value: '24/7',
			label: 'Information Availability',
			icon: 'Clock',
		},
	],
}
