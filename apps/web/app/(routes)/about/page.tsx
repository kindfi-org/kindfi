import { CallToAction } from '~/components/sections/about-us/call-to-action'
import { Hero } from '~/components/sections/about-us/hero'
import { HowItWorks } from '~/components/sections/about-us/how-it-works'
import { KindFiStellar } from '~/components/sections/about-us/kindfi-stellar'
import { MissionVision } from '~/components/sections/about-us/mission-vision'
import { Problems } from '~/components/sections/about-us/problems'
import { Roadmap } from '~/components/sections/about-us/roadmap'
import { WhyKindFiIsDifferent } from '~/components/sections/about-us/why-is-different'

export default function AboutPage() {
	return (
		<div className="w-full flex flex-col items-center text-center">
			<Hero />
			<MissionVision />
			<Problems />
			<KindFiStellar />
			<HowItWorks />
			<WhyKindFiIsDifferent />
			<Roadmap />
			<CallToAction />
		</div>
	)
}
