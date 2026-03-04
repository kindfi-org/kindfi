import { Timeline } from '~/components/shared/timeline'
import { SectionContainer } from '~/components/shared/section-container'
import { mockAboutUs } from '~/lib/mock-data/mock-about-us'

const HowItWorks = () => {
	return (
		<section
			className="flex flex-col items-center py-16 sm:py-20 lg:py-24 bg-gray-50/60"
			aria-labelledby="about-how-it-works-heading"
		>
			<SectionContainer className="text-center">
				<h2
					id="about-how-it-works-heading"
					className="text-3xl font-bold tracking-tight gradient-text mb-3 sm:text-4xl"
				>
					How KindFi Works
				</h2>
				<p className="text-muted-foreground text-base max-w-2xl mx-auto mb-10 sm:text-lg sm:mb-12">
					A transparent, milestone-based funding system backed by blockchain and
					AI.
				</p>
				<Timeline steps={mockAboutUs.howItWorks} />
			</SectionContainer>
		</section>
	)
}

export { HowItWorks }
