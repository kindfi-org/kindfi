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
import {
	ProjectCard,
	type ProjectCardProps,
} from '~/components/shared/project-card'
import { SectionCaption } from '~/components/shared/section-caption'
import { projectsContent } from '~/constants/sections/projects'

interface ProjectsShowcaseProps {
	title: string
	subtitle: string
	projects: Array<ProjectCardProps>
}

export const ProjectsShowcase = ({
	title,
	subtitle,
	projects,
}: ProjectsShowcaseProps) => {
	return (
		<section className="w-full px-4 py-10 sm:px-6 lg:px-8">
			<div className="mx-auto max-w-[1400px]">
				<SectionCaption
					title={title}
					subtitle={subtitle}
					highlightWords={projectsContent.highlightWords}
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
					>
						<CarouselContent className="-ml-2 md:-ml-4">
							{projects.map((project) => (
								<CarouselItem
									key={project.id}
									className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
								>
									<ProjectCard {...project} />
								</CarouselItem>
							))}
						</CarouselContent>
						<CarouselPrevious className="hidden sm:flex" />
						<CarouselNext className="hidden sm:flex" />
					</Carousel>
				</div>

				<div className="mt-12 flex justify-center">
					<CTAButtons
						primaryText={projectsContent.cta.primary}
						secondaryText={projectsContent.cta.secondary}
					/>
				</div>
			</div>
		</section>
	)
}
