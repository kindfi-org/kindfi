import type { Metadata } from 'next'
import { GovernanceSection } from '~/components/sections/governance'
import { JsonLd } from '~/components/shared/json-ld'
import { getBreadcrumbSchema } from '~/lib/seo/structured-data'

export const metadata: Metadata = {
	title: 'Community Governance | KindFi',
	description:
		'Participate in KindFi community governance. Vote on how the community fund is redistributed to high-impact campaigns and help shape the future of decentralized social impact funding.',
	openGraph: {
		title: 'Community Governance | KindFi',
		description:
			'Vote on how the KindFi community fund is redistributed to impactful campaigns. Decentralized governance powered by the Stellar blockchain.',
		type: 'website',
		url: '/governance',
	},
	twitter: {
		card: 'summary',
		title: 'Community Governance | KindFi',
		description:
			'Vote on fund redistribution to impactful campaigns. Decentralized community governance on KindFi.',
	},
	alternates: {
		canonical: '/governance',
	},
}

export default function GovernancePage() {
	return (
		<>
			<JsonLd
				data={getBreadcrumbSchema([
					{ name: 'Home', url: '/' },
					{ name: 'Governance', url: '/governance' },
				])}
			/>
			<GovernanceSection />
		</>
	)
}
