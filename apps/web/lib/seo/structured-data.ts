/** Canonical public site URL for SEO metadata, share links, and sitemaps. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.kindfi.org').replace(
	/\/+$/,
	'',
)

export interface OrganizationSchema {
	'@context': string
	'@type': 'Organization'
	name: string
	url: string
	logo: string
	description: string
	foundingDate: string
	sameAs: string[]
	contactPoint: {
		'@type': 'ContactPoint'
		contactType: string
		url: string
	}
}

export interface WebSiteSchema {
	'@context': string
	'@type': 'WebSite'
	name: string
	url: string
	description: string
	potentialAction: {
		'@type': 'SearchAction'
		target: { '@type': 'EntryPoint'; urlTemplate: string }
		'query-input': string
	}
}

export interface BreadcrumbListSchema {
	'@context': string
	'@type': 'BreadcrumbList'
	itemListElement: {
		'@type': 'ListItem'
		position: number
		name: string
		item: string
	}[]
}

export interface FAQPageSchema {
	'@context': string
	'@type': 'FAQPage'
	mainEntity: {
		'@type': 'Question'
		name: string
		acceptedAnswer: { '@type': 'Answer'; text: string }
	}[]
}

export function getOrganizationSchema(): OrganizationSchema {
	return {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: 'KindFi',
		url: SITE_URL,
		logo: `${SITE_URL}/icons/kindfi-logo.svg`,
		description:
			'KindFi is the first Web3 crowdfunding platform connecting supporters to impactful social and environmental causes. Milestone-based funding on Stellar ensures transparency and accountability.',
		foundingDate: '2024',
		sameAs: ['https://github.com/kindfi-org/kindfi'],
		contactPoint: {
			'@type': 'ContactPoint',
			contactType: 'customer support',
			url: `${SITE_URL}/faqs`,
		},
	}
}

export function getWebSiteSchema(): WebSiteSchema {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: 'KindFi',
		url: SITE_URL,
		description:
			'Web3 crowdfunding platform for social and environmental impact, built on the Stellar blockchain.',
		potentialAction: {
			'@type': 'SearchAction',
			target: {
				'@type': 'EntryPoint',
				urlTemplate: `${SITE_URL}/projects?search={search_term_string}`,
			},
			'query-input': 'required name=search_term_string',
		},
	}
}

export function getBreadcrumbSchema(items: { name: string; url: string }[]): BreadcrumbListSchema {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: item.name,
			item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
		})),
	}
}

export function getFaqPageSchema(faqs: { question: string; answer: string }[]): FAQPageSchema {
	return {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: faqs.map(({ question, answer }) => ({
			'@type': 'Question',
			name: question,
			acceptedAnswer: {
				'@type': 'Answer',
				text: answer,
			},
		})),
	}
}
