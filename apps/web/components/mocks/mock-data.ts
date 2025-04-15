export interface NFTTier {
	id: string
	title: string
	support: string
	left: number
}

export interface NFTCollection {
	title: string
	id: string
	rarity: string
}

export interface Comment {
	id: string
	name: string
	badge: string
	comment: string
	likes: number
}

export interface FAQ {
	id: string
	question: string
	answer: string
	category: string
}

export const nftTiers: NFTTier[] = [
	{ id: 'nftt-1', title: 'Early Bird', support: 'Support $50+', left: 100 },
	{ id: 'nftt-2', title: 'Impact Maker', support: 'Support $100+', left: 50 },
	{
		id: 'nftt-3',
		title: 'Project Champion',
		support: 'Support $500+',
		left: 10,
	},
]

export const nftCollection: NFTCollection[] = [
	{ title: 'Early Bird', id: '#042', rarity: 'Rare' },
	{ title: 'Impact Maker', id: '#021', rarity: 'Epic' },
	{ title: 'Project Champion', id: '#007', rarity: 'Legendary' },
]

export const comments: Comment[] = [
	{
		id: 'comment-1',
		name: 'Sarah M.',
		badge: 'Early Supporter',
		comment:
			'Amazing to see the project reach its goal! The community really came together. 🎉',
		likes: 24,
	},
	{
		id: 'comment-2',
		name: 'David K.',
		badge: 'Project Champion',
		comment:
			'The transparency and regular updates made this journey special. Looking forward to the impact report! 📊',
		likes: 18,
	},
]

export const faqData: Record<string, FAQ[]> = {
	platform: [
		{
			id: '1',
			question: 'What is KindFi, and how does it work?',
			answer:
				'KindFi is a Web3 crowdfunding platform for social impact causes. It uses blockchain and AI to ensure secure, transparent donations through milestone-based fund releases. Supporters can discover campaigns, donate using crypto, and track how funds are used.',
			category: 'platform',
		},
		{
			id: '2',
			question: 'How does KindFi ensure transparency and trust?',
			answer:
				'KindFi integrates the Stellar blockchain and trustless escrow to record every donation on-chain. Funds are only released when project milestones are verified, ensuring total transparency and accountability.',
			category: 'platform',
		},
		{
			id: '3',
			question:
				'What makes KindFi different from traditional crowdfunding platforms?',
			answer:
				'KindFi eliminates intermediaries, reduces fees, and introduces blockchain-powered accountability. It offers gamified rewards, open-source development, and AI-driven campaign optimization—all with a focus on social good.',
			category: 'platform',
		},
		{
			id: '4',
			question: 'Is KindFi open source? Can I contribute?',
			answer:
				'Yes! KindFi is an open-source project welcoming developers at all levels. You can contribute via structured GitHub issues, OnlyDust hackathons, and join our growing contributor community.',
			category: 'platform',
		},
		{
			id: '5',
			question: 'Which blockchain does KindFi use, and why Stellar?',
			answer:
				'KindFi is powered by the Stellar blockchain for its low fees, fast transactions, and global accessibility. Stellar also supports our milestone-based escrow model to guarantee transparency.',
			category: 'platform',
		},
		{
			id: '6',
			question: 'What is Trustless Work escrow, and how does it protect funds?',
			answer:
				'Trustless Work escrow is a blockchain-based system that holds donated funds securely until project milestones are met. It ensures that no funds are released without verified progress, reducing the risk of misuse.',
			category: 'platform',
		},
	],
	campaigns: [
		{
			id: '7',
			question: 'How do I start a fundraising campaign on KindFi?',
			answer:
				'To start a campaign, register on the platform, complete the onboarding course, and submit your project for AI review. Once approved, your campaign will be listed with milestone-based funding stages.',
			category: 'campaigns',
		},
		{
			id: '8',
			question: 'What are the requirements to launch a project?',
			answer:
				'You need a verified identity (KYC), a well-defined cause, and milestone plans. Completion of the KindFi Academy onboarding ensures your project meets our transparency and impact criteria.',
			category: 'campaigns',
		},
		{
			id: '9',
			question: 'How does the milestone-based escrow system work?',
			answer:
				'Funds are released in tranches as your project completes verified milestones. This model ensures progress, builds donor trust, and prevents misuse of donations.',
			category: 'campaigns',
		},
		{
			id: '10',
			question: 'Can I receive funding in stages, or is it all at once?',
			answer:
				'Funding is released in stages. Each tranche is unlocked only after you provide evidence that the previous milestone has been completed and verified.',
			category: 'campaigns',
		},
		{
			id: '11',
			question: 'What happens if my project doesn’t reach its funding goal?',
			answer:
				'If a project fails to reach its funding goal or complete milestones, unused funds remain in escrow. Refunds or reallocation are handled transparently, with options for donors to redirect their impact.',
			category: 'campaigns',
		},
		{
			id: '12',
			question: 'Are there fees for creating a campaign?',
			answer:
				'KindFi charges minimal fees to sustain the platform, but they are significantly lower than traditional crowdfunding platforms thanks to blockchain efficiencies.',
			category: 'campaigns',
		},
		{
			id: '13',
			question: 'How does KindFi verify and approve campaigns?',
			answer:
				'KindFi uses AI to review campaigns for legitimacy and clarity. Human moderation ensures alignment with social impact standards. Only verified projects are listed.',
			category: 'campaigns',
		},
		{
			id: '14',
			question: 'How do I provide updates to my backers?',
			answer:
				'Project creators can post updates directly on their campaign page. Backers receive notifications and see progress towards each milestone.',
			category: 'campaigns',
		},
	],
	donors: [
		{
			id: '15',
			question: 'How do I donate to a campaign on KindFi?',
			answer:
				'Click on any active campaign, connect your wallet, and choose a donation tier. You can use supported cryptocurrencies to contribute directly.',
			category: 'donors',
		},
		{
			id: '16',
			question: 'Which cryptocurrencies does KindFi accept?',
			answer:
				'KindFi currently supports donations in USDC and XLM, with plans to expand to additional Stellar-compatible and ERC-20 tokens.',
			category: 'donors',
		},
		{
			id: '17',
			question: 'Why does KindFi use USDC and XLM for donations?',
			answer:
				'USDC provides price stability, while XLM ensures low-cost, fast transactions. Both are ideal for transparent, accessible global giving.',
			category: 'donors',
		},
		{
			id: '18',
			question: 'Do I need a Stellar wallet to donate?',
			answer:
				'No. You can donate using any supported Web3 wallet. Stellar wallets are recommended for enhanced features like donation tracking and NFT rewards.',
			category: 'donors',
		},
		{
			id: '19',
			question: 'How do I connect my wallet to KindFi?',
			answer:
				'Click "Connect Wallet" and follow the prompts to link your Metamask, Ledger, or any other compatible wallet. Stellar and Ethereum wallets are supported.',
			category: 'donors',
		},
		{
			id: '20',
			question: 'Are there transaction fees when donating?',
			answer:
				'Yes, but they are minimal thanks to Stellar’s low-cost blockchain. KindFi does not charge additional fees on top of blockchain gas fees.',
			category: 'donors',
		},
		{
			id: '21',
			question: 'Can I donate anonymously?',
			answer:
				'Yes. Verified users can choose to donate anonymously while still receiving NFT rewards and recognition inside their private profile.',
			category: 'donors',
		},
		{
			id: '22',
			question: 'How do I track my donations on the blockchain?',
			answer:
				'Each transaction is recorded on-chain. You can view your donation history in your KindFi profile or verify it directly on the Stellar explorer.',
			category: 'donors',
		},
		{
			id: '23',
			question: 'Can I get a refund if the project fails?',
			answer:
				'If milestones are not met, funds remain in escrow. Depending on your settings, donations can be refunded or redirected to other impactful projects through our yearly community vote.',
			category: 'donors',
		},
	],
	security: [
		{
			id: '24',
			question: 'Is my donation secure?',
			answer:
				'Yes. Donations are secured in a blockchain-based escrow and only released when milestones are verified. The system is transparent and tamper-proof.',
			category: 'security',
		},
		{
			id: '25',
			question: 'How does KindFi ensure funds go to the right projects?',
			answer:
				'AI-powered project reviews, milestone-based escrow, and community verification all work together to ensure funds are allocated correctly and fairly.',
			category: 'security',
		},
		{
			id: '26',
			question: 'Are my transactions publicly visible on the blockchain?',
			answer:
				'Yes. All donations are transparently recorded on the Stellar blockchain and can be verified at any time.',
			category: 'security',
		},
		{
			id: '27',
			question: 'What happens if a project is flagged as fraudulent?',
			answer:
				'Flagged projects are paused and reviewed by our team. Funds in escrow remain locked until a final decision is made. If fraud is confirmed, refunds or redirection options are activated.',
			category: 'security',
		},
	],
}

export const categoryTitles: Record<
	string,
	{ title: string; subtitle: string }
> = {
	platform: {
		title: 'Platform FAQs',
		subtitle: 'General questions about KindFi',
	},
	campaigns: {
		title: 'Campaign FAQs',
		subtitle: 'Learn how to launch and manage campaigns',
	},
	donors: {
		title: 'Donor FAQs',
		subtitle: 'Everything you need to know about donating',
	},
	security: {
		title: 'Security & Verification',
		subtitle: 'How we keep your funds and data safe',
	},
}
