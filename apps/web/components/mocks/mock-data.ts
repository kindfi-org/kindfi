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
			answer: 'Answer 1',
			category: 'platform',
		},
		{
			id: '2',
			question: 'How does KindFi ensure transparency and trust?',
			answer: 'Answer 2',
			category: 'platform',
		},
		{
			id: '3',
			question:
				'What makes KindFi different from traditional crowdfunding platforms?',
			answer: 'Answer 3',
			category: 'platform',
		},
		{
			id: '4',
			question: 'Is KindFi open source? Can I contribute?',
			answer: 'Answer 4',
			category: 'platform',
		},
		{
			id: '5',
			question: 'Which blockchain does KindFi use, and why Stellar?',
			answer: 'Answer 5',
			category: 'platform',
		},
		{
			id: '6',
			question: 'What is Trustless Work escrow, and how does it protect funds?',
			answer: 'Answer 6',
			category: 'platform',
		},
	],
	campaigns: [
		{
			id: '7',
			question: 'How do I start a fundraising campaign on KindFi?',
			answer: 'Answer 7',
			category: 'campaigns',
		},
		{
			id: '8',
			question: 'What are the requirements to launch a project?',
			answer: 'Answer 8',
			category: 'campaigns',
		},
		{
			id: '9',
			question: 'How does the milestone-based escrow system work?',
			answer: 'Answer 9',
			category: 'campaigns',
		},
		{
			id: '10',
			question: 'Can I receive funding in stages, or is it all at once?',
			answer: 'Answer 10',
			category: 'campaigns',
		},
		{
			id: '11',
			question: 'What happens if my project doesn’t reach its funding goal?',
			answer: 'Answer 11',
			category: 'campaigns',
		},
		{
			id: '12',
			question: 'Are there fees for creating a campaign?',
			answer: 'Answer 12',
			category: 'campaigns',
		},
		{
			id: '13',
			question: 'How does KindFi verify and approve campaigns?',
			answer: 'Answer 13',
			category: 'campaigns',
		},
		{
			id: '14',
			question: 'How do I provide updates to my backers?',
			answer: 'Answer 14',
			category: 'campaigns',
		},
	],
	donors: [
		{
			id: '15',
			question: 'How do I donate to a campaign on KindFi?',
			answer: 'Answer 15',
			category: 'donors',
		},
		{
			id: '16',
			question: 'Which cryptocurrencies does KindFi accept?',
			answer: 'Answer 16',
			category: 'donors',
		},
		{
			id: '17',
			question: 'Why does KindFi use USDC and XLM for donations?',
			answer: 'Answer 17',
			category: 'donors',
		},
		{
			id: '18',
			question: 'Do I need a Stellar wallet to donate?',
			answer: 'Answer 18',
			category: 'donors',
		},
		{
			id: '19',
			question: 'How do I connect my wallet to KindFi?',
			answer: 'Answer 19',
			category: 'donors',
		},
		{
			id: '20',
			question: 'Are there transaction fees when donating?',
			answer: 'Answer 20',
			category: 'donors',
		},
		{
			id: '21',
			question: 'Can I donate anonymously?',
			answer: 'Answer 21',
			category: 'donors',
		},
		{
			id: '22',
			question: 'How do I track my donations on the blockchain?',
			answer: 'Answer 22',
			category: 'donors',
		},
		{
			id: '23',
			question: 'Can I get a refund if the project fails?',
			answer: 'Answer 24',
			category: 'donors',
		},
	],
	security: [
		{
			id: '24',
			question: 'Is my donation secure?',
			answer: 'Answer 24',
			category: 'security',
		},
		{
			id: '25',
			question: 'How does KindFi ensure funds go to the right projects?',
			answer: 'Answer 25',
			category: 'security',
		},
		{
			id: '26',
			question: 'Are my transactions publicly visible on the blockchain?',
			answer: 'Answer 26',
			category: 'security',
		},
		{
			id: '27',
			question: 'What happens if a project is flagged as fraudulent?',
			answer: 'Answer 27',
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
