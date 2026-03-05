import type { Metadata } from 'next'
import { CallToAction } from '~/components/sections/about-us/call-to-action'
import { Hero } from '~/components/sections/about-us/hero'
import { HowItWorks } from '~/components/sections/about-us/how-it-works'
import { KindFiStellar } from '~/components/sections/about-us/kindfi-stellar'
import { MissionVision } from '~/components/sections/about-us/mission-vision'
import { Problems } from '~/components/sections/about-us/problems'
import { Roadmap } from '~/components/sections/about-us/roadmap'
import { WhyKindFiIsDifferent } from '~/components/sections/about-us/why-is-different'

export const metadata: Metadata = {
	title: 'About Us | KindFi',
	description:
		'Learn how KindFi is transforming crowdfunding with transparent, milestone-based funding, blockchain, and AI. Our mission, vision, and roadmap for social impact.',
	openGraph: {
		title: 'About Us | KindFi',
		description:
			'Learn how KindFi is transforming crowdfunding with transparent, milestone-based funding, blockchain, and AI.',
	},
}

export default function AboutPage() {
	return (
		<main
			className="w-full flex flex-col items-center text-center"
			aria-label="About KindFi"
		>
			<Hero />
			<MissionVision />
			<Problems />
			<KindFiStellar />
			<HowItWorks />
			<WhyKindFiIsDifferent />
			<Roadmap />
			<CallToAction />
		</main>
	)
}
