import type { InvestmentContent } from './types'

export const investmentContent: InvestmentContent = {
	title: 'Secure, Transparent, and Powered by Web3',
	subtitle:
		'At KindFi, we ensure that every donation or contribution is backed by the security and transparency of a Web3-based Escrow system. Smart contracts guarantee that funds reach their intended destination to create real impact.',
	highlightWords: ['Powered by Web3'],
	models: [
		{
			id: 'secure-escrow-id',
			title: 'Secure Escrow',
			description:
				'Funds are held in a verified escrow account by Trustless work until the projects goal is met, ensuring the safety and reliability of your contributions.',
			variant: 'a',
			icon: 'Shield',
			benefits: [
				{ id: 'smart-contracts-id', text: 'Smart Contracts' },
				{ id: 'secure-fund-custody-id', text: 'Secure Fund Custody' },
				{ id: 'blockchain-transparency-id', text: 'Blockchain Transparency' },
			],
		},
		{
			id: 'social-impact-id',
			title: 'Social ImpactReal',
			description:
				'Once a project achieves its goal, funds are directly released to the social cause, fully backed by smart contracts to ensure transparency and trust.',
			variant: 'b',
			icon: 'Users',
			benefits: [
				{ id: 'impact-reports-id', text: 'Impact Reports' },
				{ id: 'real-time-tracking-id', text: 'Real-Time Tracking' },
				{ id: 'engaged-communities-id', text: 'Engaged Communities' },
			],
		},
		{
			id: 'blockchain-web3-id',
			title: 'Powered by Blockchain and Web3',
			description:
				'Connect your wallet and participate securely, transparently, and efficiently. Every transaction is recorded on the blockchain.',
			variant: 'c',
			icon: 'Globe',
			benefits: [
				{ id: 'instant-transactions-id', text: 'Instant Transactions' },
				{ id: 'immutable-records-id', text: 'Immutable Records' },
				{
					id: 'nft-certificates-tokens-id',
					text: 'NFT Certificates and Tokens',
				},
			],
		},
	],
}
