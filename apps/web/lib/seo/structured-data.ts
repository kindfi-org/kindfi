const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.kindfi.org'

export function getOrganizationSchema() {
	return {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: 'KindFi',
		url: BASE_URL,
		logo: `${BASE_URL}/icons/kindfi-logo.svg`,
		description:
			'KindFi is the first Web3 crowdfunding platform connecting supporters to impactful social and environmental causes. Milestone-based funding on Stellar ensures transparency and accountability.',
		foundingDate: '2024',
		sameAs: ['https://github.com/kindfi-org/kindfi'],
		contactPoint: {
			'@type': 'ContactPoint',
			contactType: 'customer support',
			url: `${BASE_URL}/faqs`,
		},
	}
}

export function getWebSiteSchema() {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: 'KindFi',
		url: BASE_URL,
		description:
			'Web3 crowdfunding platform for social and environmental impact, built on the Stellar blockchain.',
		potentialAction: {
			'@type': 'SearchAction',
			target: {
				'@type': 'EntryPoint',
				urlTemplate: `${BASE_URL}/projects?search={search_term_string}`,
			},
			'query-input': 'required name=search_term_string',
		},
	}
}

export function getBreadcrumbSchema(items: { name: string; url: string }[]) {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: item.name,
			item: item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`,
		})),
	}
}

export function getFaqPageSchema(faqs: { question: string; answer: string }[]) {
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
