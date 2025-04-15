export const mockAboutUs = {
	missionVision: {
		mission: {
			title: 'Our Mission',
			description:
				'To empower communities by transforming how funding reaches social causes — with transparent, traceable, and trust-based crowdfunding powered by blockchain.',
		},
		vision: {
			title: 'Our Vision',
			description:
				'A future where anyone, anywhere, can fund or launch a cause with confidence — backed by smart contracts, verified impact, and the accessibility of blockchain technology.',
		},
	},
	problems: [
		{
			title: 'Lack of Transparency',
			description:
				"Most platforms keep donors in the dark. KindFi makes every transaction and milestone publicly verifiable through Stellar smart contracts.",
			icon: 'lock',
		},
		{
			title: 'High Costs',
			description:
				'Fees around 6 to 8 % or even hidden and intermediaries eat into donations. Our model minimizes costs, ensuring more funds reach the cause.',
			icon: 'shield',
		},
		{
			title: 'Limited Engagement',
			description:
				'Traditional donations are one-off. KindFi introduces dynamic NFTs, quests, and reputation-based governance to keep supporters engaged and rewarded over time.',
			icon: 'users',
		},
		{
			title: 'No Proof of Progress',
			description:
				'On legacy platforms, anyone can launch a project even without follow-through. On KindFi, funds are released only when verified milestones are met.',
			icon: 'users',
		},
	],
	howItWorks: [
		{
			icon: 'globe',
			title: 'Project Submission',
			description: 'Cause creators submit their campaigns with clear goals and impact milestones. AI helps evaluate legitimacy, optimize storytelling, and flag inconsistencies before review',
		},
		{
			icon: 'lock',
			title: 'Secure Donations',
			description: 'Approved projects go live. Donations are held in Soroban-powered smart escrow contracts on the Stellar blockchain — never directly transferred Contributors use wallets and biometric passkeys for secure, on-chain participation',
		},
		{
			icon: 'check-circle',
			title: 'Milestone-Based Releases',
			description: 'Funds are released in tranches only when verified milestones are met — such as progress photos, reports, or social proof.',
		},
		{
			icon: 'star',
			title: 'Community Growth',
			description: 'Kinders unlock governance power, exclusive access, and future project prioritization — building a trusted, on-chain identity layer.',
		},
	],
	whyIsDifferent: [
		{
			title: 'Total Transparency',
			description:
				'Every donation is recorded and traceable on-chain through Stellar, ensuring public accountability at every step — no hidden flows, no guesswork.',
			icon: 'star',
		},
		{
			title: 'Smart Escrow System',
			description:
				'Funds aren’t released until progress is proven. With Soroban smart contracts, milestones must be verified to unlock each tranche — protecting contributors and building real trust.',
			icon: 'check-circle',
		},
		{
			title: 'Global Accessibility',
			description:
				'Anyone can contribute — no matter the currency, language, or location. KindFi supports multilingual access, crypto and fiat flows, and onramps for global inclusion.',
			icon: 'globe',
		},
	],
	kindfiStellarFeatures: [
		{
			id: 'financial-inclusion',
			title: 'Speed + Affordability',
			description: 'Making donations accessible to all',
			icon: 'globe',
		},
		{
			id: 'transparency-security',
			title: 'Built for Compliance',
			description: 'All transactions are auditable',
			icon: 'shield-check',
		},
		{
			id: 'global-transactions',
			title: 'Fiat-to-Crypto Friendly',
			description: 'Fast & affordable payments via Stellar',
			icon: 'banknote',
		},
		{
			id: 'instant-settlement',
			title: 'Global-First, LATAM-Ready',
			description: 'Funds transfer in seconds, not days',
			icon: 'clock',
		},
		{
			id: 'smart-contracts',
			title: 'Smart Contracts',
			description: 'Automated funding releases via Stellar’s smart contracts',
			icon: 'file-code',
		},
		{
			id: 'low-fees',
			title: 'Low Transaction Fees',
			description: 'Donations maximize impact with near-zero fees',
			icon: 'badge-dollar-sign',
		},
		{
			id: 'decentralization',
			title: 'Reputation-Driven',
			description: 'No middlemen, direct and secure funding',
			icon: 'network',
		},
		{
			id: 'cross-border',
			title: 'Borderless Giving',
			description: 'Donate globally without banking restrictions',
			icon: 'globe',
		},
	],

	roadmap: [
		{
			id: 1,
			title: 'AI-Powered Crowdfunding Optimization',
			details: "AI agents to vet campaigns, optimize narratives, detect fraud, and surface the most promising projects"
		},
		{
			id: 2,
			title: 'Global NGO & Foundation Partnerships',
			details: "Collaborations with NGOs and foundations across Latin America to onboard high-impact causes, expand reach and impact"
		},
		{
			id: 3,
			title: 'Soroban-Powered Smart Contracts',
			details: "Robust governance, referral, streak, and fund management systems using Soroban—enabling decentralized fund releases, NFT-based reputation, and community voting"
		},
		{
			id: 4,
			title: 'Multi-Currency & On-Ramp Integration',
			details: "Support for USDC, XLM, and fiat onramps to allow seamless contributions from anywhere in the world—crypto-native or not"
		},
	],
}
