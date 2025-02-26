import { Timeline } from '~/components/shared/timeline'
import { mockAboutUs } from '~/lib/mock-data/mock-about-us'

const HowItWorks = () => {
	return (
		<section className="flex flex-col items-center py-16 bg-gray-100">
			<h2 className="text-3xl font-bold mb-4 text-gray-900">
				How KindFi Works
			</h2>
			<p className="text-lg text-gray-600 text-center mb-8">
				A seamless process that ensures transparency and trust at every step.
			</p>
			<Timeline steps={mockAboutUs.howItWorks} />
		</section>
	)
}

export { HowItWorks }
