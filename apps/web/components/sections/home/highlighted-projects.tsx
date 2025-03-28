'use client'

import Autoplay from 'embla-carousel-autoplay'
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from '~/components/base/carousel'
import { CTAButtons } from '~/components/shared/cta-buttons'
import ProjectCard from '~/components/shared/project-card'
import { SectionCaption } from '~/components/shared/section-caption'
import { projects } from '~/lib/mock-data/mock-projects'
import { HOME as constants } from '~/constants'

export function HighlightedProjects() {
	return (
		<section className="w-full px-4 py-10 sm:px-6 lg:px-8">
			<div className="mx-auto max-w-[1400px]">
				<SectionCaption
					title={constants.CAPTIONS.HIGHLIGHTED_PROJECTS.title}
					subtitle={constants.CAPTIONS.HIGHLIGHTED_PROJECTS.subtitle}
					highlightWords={constants.CAPTIONS.HIGHLIGHTED_PROJECTS.highlighted}
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
						<CarouselPrevious
							className="hidden sm:flex"
							aria-label="Previous slide"
						/>
						<CarouselNext className="hidden sm:flex" aria-label="Next slide" />
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
