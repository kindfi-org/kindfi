import {
	Banknote,
	CreditCard,
	DollarSign,
	TrendingDown,
	Wallet,
} from 'lucide-react'

import type {
	CompanyResources,
	FinancialOverview,
	HighlightItem,
	HighlightedUpdate,
	Investor,
} from '~/lib/types/project/overview-section.types'

export const highlightItems: HighlightItem[] = [
	{
		id: 'vc-backed',
		title: 'VC-Backed',
		description: 'Raised $250K or more from a venture firm',
	},
	{
		id: 'traction',
		title: 'Traction',
		description: '$110M in signed customer LOIs',
		indicator: 1,
	},
	{
		id: 'team',
		title: 'Team',
		description:
			'Powerhouse of experts in tech, engineering & biz, united to transform energy systems',
		indicator: 2,
	},
	{
		id: 'technology',
		title: 'Technology',
		description:
			'Fully functional 40%-scale prototype proving our technologies and design architecture',
		indicator: 3,
	},
	{
		id: 'patents',
		title: 'Patents',
		description: '3 applications filed to protect our core innovations',
		indicator: 4,
	},
	{
		id: 'market-potential',
		title: 'Market Potential',
		description:
			'Projected to address a $500B+ market with increasing global energy demands',
		indicator: 5,
	},
	{
		id: 'sustainability',
		title: 'Sustainability',
		description:
			'Designed for clean energy with zero emissions and a circular economy approach',
		indicator: 6,
	},
]

export const financialOverview: FinancialOverview = {
	period: 'Q4 2023',
	summaryText:
		'Our financial statements end on December 31, 2023. Our current cash balance is $250,000 as of October 2024. During the previous three months, average monthly revenue was $0, average cost of goods sold was $0, and average operating expenses were $100,000 per month.',
	burnRateText:
		'At the current burn rate of $100,000 per month, the company has approximately 2.5 months of runway remaining. This fundraising round is critical to extend operations and reach key milestones.',
	metrics: [
		{
			id: 'revenue',
			title: 'Revenue',
			value: '$0',
			icon: <DollarSign className="h-6 w-6 text-blue-600" />,
			iconBgColor: 'bg-blue-100 group-hover:bg-blue-200',
		},
		{
			id: 'net-loss',
			title: 'Net Loss',
			value: '-$818,451',
			icon: <TrendingDown className="h-6 w-6 text-red-600" />,
			iconBgColor: 'bg-red-100 group-hover:bg-red-200',
			textColor: 'text-red-600',
		},
		{
			id: 'short-term-debt',
			title: 'Short-Term Debt',
			value: '$128,720',
			icon: <CreditCard className="h-6 w-6 text-orange-600" />,
			iconBgColor: 'bg-orange-100 group-hover:bg-orange-200',
			percentage: 8,
		},
		{
			id: 'raised',
			title: 'Raised in 2023',
			value: '$2,075,621',
			icon: <Banknote className="h-6 w-6 text-green-600" />,
			iconBgColor: 'bg-green-100 group-hover:bg-green-200',
		},
		{
			id: 'cash',
			title: 'Cash Available',
			value: '$250,000',
			icon: <Wallet className="h-6 w-6 text-purple-600" />,
			iconBgColor: 'bg-purple-100 group-hover:bg-purple-200',
		},
	],
}

export const companyResources: CompanyResources = {
	companyName: 'Qnetic Corporation',
	infoLink: 'https://example.com/spv-information',
	documents: [
		{
			id: 'spv-agreement',
			title: 'SPV Subscription Agreement',
			href: '/documents/spv-subscription-agreement.pdf',
		},
		{
			id: 'safe-agreement',
			title: 'SAFE (Simple Agreement for Future Equity)',
			href: '/documents/safe-agreement.pdf',
		},
	],
}

export const highlightedUpdate: HighlightedUpdate = {
	title: 'Professionals Vote Qnetic #1 Investment Opportunity',
	imageUrl: '/images/image.png',
	imageAlt: 'Qnetic investment opportunity',
	overlaySubtitle: 'The',
	overlayTitle: "Judges' Choice Award Winner",
	author: {
		name: 'Joyce Zhou',
		avatar: '/avatar.svg',
		initials: 'JZ',
	},
	date: 'Mar 19',
	likes: 7,
	comments: 2,
	updatesUrl: '/updates',
	readMoreUrl: '/updates/professionals-vote-qnetic',
}

export const investors: Investor[] = [
	{
		id: 'jonh-anderson',
		name: 'John Anderson',
		bio: 'Angel investor with a background in corporate leadership and a passion for sustainable innovation.',
		avatar: '/placeholder.svg?height=80&width=80',
		initials: 'PI',
		isPrincipal: true,
		quote: {
			text: "I was initially attracted to Qnetic because of its focus on clean energy. What really convinced me to invest, however, was the team. The combined experience of Mike, Malcolm, Loic, and Mathias—all at high levels in the corporate world before moving into entrepreneurship—really impressed me. When people with that kind of background come together with a shared vision, it's a strong indicator of success.\n\nOn top of that, I think the product is awesome. They have understood the nuances of the problem and arrived at a stand-out solution. Lithium mining and chemical batteries are big contradictions in the green energy space, but Qnetic offers a genuine alternative. They're serious about making green energy truly sustainable, and that's what sets them apart. With the right financing, I believe this team can accomplish great things.",
		},
		profileUrl: '/investors/john-anderson',
	},
	{
		id: 'russell-murphy',
		name: 'Russell Murphy',
		bio: 'Investor and former startup lawyer.',
		avatar: '/placeholder.svg?height=60&width=60',
		initials: 'RM',
		quote: {
			text: "It's a very exciting technology for our future generation. I made this investment for my children.",
		},
		profileUrl: '/investors/russell-murphy',
	},
	{
		id: 'david-keiser',
		name: 'David Keiser',
		bio: 'Co-founder of highly successful biopharmaceutical company',
		avatar: '/placeholder.svg?height=60&width=60',
		initials: 'DK',
		quote: {
			text: 'The ability to store energy generated through renewable sources is the most significant challenge facing us today.',
		},
		profileUrl: '/investors/david-keiser',
	},
]
