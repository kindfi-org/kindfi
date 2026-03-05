import type { Metadata } from 'next'
import { GovernanceSection } from '~/components/sections/governance'

export const metadata: Metadata = {
	title: 'Community Governance | KindFi',
	description:
		'Vote on how the KindFi community fund is redistributed to impactful campaigns.',
}

export default function GovernancePage() {
	return (
		<div className="container mx-auto px-4 py-10 max-w-4xl">
			<GovernanceSection />
		</div>
	)
}
