import type { ReactNode } from 'react'

export interface HighlightItem {
	id: string
	title: string
	description: string
	indicator?: number
}

export interface FinancialMetric {
	id: string
	title: string
	value: string
	icon: ReactNode
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

export interface DocumentLink {
	id: string
	title: string
	href: string
}

export interface CompanyResources {
	companyName: string
	infoLink: string
	documents: DocumentLink[]
}

export interface Author {
	name: string
	avatar: string
	initials: string
}

export interface HighlightedUpdate {
	title: string
	imageUrl: string
	imageAlt: string
	overlayTitle: string
	overlaySubtitle: string
	author: Author
	date: string
	likes: number
	comments: number
	updatesUrl: string
	readMoreUrl: string
}

export interface InvestorQuote {
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
