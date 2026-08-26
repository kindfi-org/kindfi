import type { Metadata } from 'next'
import { DynamicAboutSections } from '~/components/sections/about-us/dynamic-sections'
import { JsonLd } from '~/components/shared/json-ld'
import { getBreadcrumbSchema } from '~/lib/seo/structured-data'

export const metadata: Metadata = {
	title: 'About Us | KindFi',
	description:
		"Learn about KindFi's mission, how milestone-based crowdfunding on Stellar works, and why transparent, blockchain-powered funding is the future of social impact.",
	openGraph: {
		title: 'About KindFi — Blockchain Crowdfunding for Social Impact',
		description:
			'Milestone-based crowdfunding on Stellar: mission, product story, how it works, and our roadmap for transparent social impact funding.',
		type: 'website',
		url: '/about',
	},
	twitter: {
		card: 'summary_large_image',
		title: 'About KindFi | Web3 Crowdfunding for Social Impact',
		description:
			'Milestone-based crowdfunding on Stellar: our mission, how it works, and our roadmap.',
	},
	alternates: {
		canonical: '/about',
	},
}

export default function AboutPage() {
	return (
		<>
			<JsonLd
				data={getBreadcrumbSchema([
					{ name: 'Home', url: '/' },
					{ name: 'About Us', url: '/about' },
				])}
			/>
			<main className="flex w-full flex-col bg-white" aria-label="About KindFi">
				<DynamicAboutSections.Hero />
				<DynamicAboutSections.MissionVision />
				<DynamicAboutSections.Problems />
				<DynamicAboutSections.KindFiStellar />
				<DynamicAboutSections.HowItWorks />
				<DynamicAboutSections.WhyKindFiIsDifferent />
				<DynamicAboutSections.Roadmap />
				<DynamicAboutSections.CallToAction />
			</main>
		</>
	)
}
