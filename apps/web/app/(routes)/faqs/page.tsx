import type { Metadata } from 'next'
import { FaqContainer } from '~/components/sections/faqs/faq-container'
import { JsonLd } from '~/components/shared/json-ld'
import { faqData } from '~/lib/mock-data/project/project-card-variants.mock'
import { getBreadcrumbSchema, getFaqPageSchema } from '~/lib/seo/structured-data'

export const metadata: Metadata = {
	title: 'FAQs | KindFi',
	description:
		'Find answers to the most common questions about KindFi — how the platform works, how to support campaigns, how funds are secured on Stellar, and more.',
	openGraph: {
		title: 'Frequently Asked Questions | KindFi',
		description:
			'Everything you need to know about donating, launching campaigns, and how KindFi uses Stellar blockchain to ensure transparent, milestone-based funding.',
		type: 'website',
		url: '/faqs',
	},
	twitter: {
		card: 'summary',
		title: 'FAQs | KindFi',
		description:
			'Answers to common questions about KindFi — crypto donations, campaign milestones, and platform security.',
	},
	alternates: {
		canonical: '/faqs',
	},
}

const allFaqs = Object.values(faqData).flat()

export default function FaqsPage() {
	return (
		<>
			<JsonLd
				data={getFaqPageSchema(allFaqs.map(({ question, answer }) => ({ question, answer })))}
			/>
			<JsonLd
				data={getBreadcrumbSchema([
					{ name: 'Home', url: '/' },
					{ name: 'FAQs', url: '/faqs' },
				])}
			/>
			<FaqContainer />
		</>
	)
}
