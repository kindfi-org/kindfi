import type { Metadata } from 'next'
import { CallToAction } from '~/components/sections/about-us/call-to-action'
import { Hero } from '~/components/sections/about-us/hero'
import { HowItWorks } from '~/components/sections/about-us/how-it-works'
import { KindFiStellar } from '~/components/sections/about-us/kindfi-stellar'
import { MissionVision } from '~/components/sections/about-us/mission-vision'
import { Problems } from '~/components/sections/about-us/problems'
import { Roadmap } from '~/components/sections/about-us/roadmap'
import { WhyKindFiIsDifferent } from '~/components/sections/about-us/why-is-different'
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
				<Hero />
				<MissionVision />
				<Problems />
				<KindFiStellar />
				<HowItWorks />
				<WhyKindFiIsDifferent />
				<Roadmap />
				<CallToAction />
			</main>
		</>
	)
}
