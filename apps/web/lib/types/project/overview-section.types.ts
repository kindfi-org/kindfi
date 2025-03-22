export interface HighlightItem {
	id: string
	title: string
	description: string
	indicator?: number
	backgroundColor?: string
}

interface FinancialMetric {
	id: string
	title: string
	value: string
	icon: React.ReactNode
	iconBgColor: string
	textColor?: string
	percentage?: number
}

export interface FinancialOverview {
	period: string
	summaryText: string
	burnRateText: string
	metrics: FinancialMetric[]
}

interface DocumentLink {
	id: string
	title: string
	href: string
}

export interface CompanyInfo {
	companyName: string
	infoLink: string
	documents: DocumentLink[]
}

export interface FeaturedUpdate {
	title: string
	imageUrl: string
	imageAlt: string
	overlayTitle: string
	overlaySubtitle: string
	author: {
		name: string
		avatar: string
		initials: string
	}
	date: string
	likes: number
	comments: number
	updatesUrl: string
	readMoreUrl: string
}

interface InvestorQuote {
	text: string
}

export interface Investor {
	id: string
	name: string
	bio: string
	avatar: string
	initials: string
	isPrincipal?: boolean
	quote?: InvestorQuote
	profileUrl?: string
}
