'use client'

import Autoplay from 'embla-carousel-autoplay'
import {
	Carousel,
	CarouselContent,
	CarouselItem,
} from '~/components/base/carousel'
import { CTAButtons } from '~/components/shared/cta-buttons'
import ProjectCard from '~/components/shared/project-card'
import { SectionCaption } from '~/components/shared/section-caption'
import { projects } from '~/constants/hightlighted-projects'

export function HighlightedProjects() {
	return (
		<section className="w-full px-4 py-10 sm:px-6 lg:px-8">
			<div className="mx-auto max-w-[1400px]">
				<SectionCaption
					title="Change Lives One Block at a Time"
					subtitle="From clean water and education to healthcare and child welfare, each project on KindFi represents a real-world AID opportunity to make a difference. Explore verified community-backed campaigns, track progress transparently, and support what moves you all through the power of blockchain"
					highlightWords={['Change Lives One Block at a Time']}
				/>

				<div className="relative">
					<Carousel
						opts={{
							align: 'start',
							loop: true,
						}}
						plugins={[
							Autoplay({
								delay: 2000,
							}),
						]}
						className="w-full"
						aria-label="Featured Projects"
					>
						<CarouselContent className="-ml-2 md:-ml-4">
							{projects.map((project) => (
								<CarouselItem
									key={project.id}
									className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
									aria-roledescription="slide"
								>
									<ProjectCard project={project} />
								</CarouselItem>
							))}
						</CarouselContent>
					</Carousel>
				</div>

				<div className="mt-12 flex justify-center">
					<CTAButtons
						primaryText="Register Your Project"
						secondaryText="Explore Causes"
					/>
				</div>
			</div>
		</section>
	)
}
