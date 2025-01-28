import type React from 'react'
import ImpactCards from '~/components/sections/project/impact-cards'
import SectionContainer from '~/components/sections/project/section-container'
import Timeline from '~/components/sections/project/timeline'
import {
	statsDataUpdates,
	successGalleryItems,
	timelineEvents,
} from '~/lib/constants/mock-data/mock-projects'

const ProjectUpdatesSection = () => {
	return (
		<SectionContainer>
			<div className="bg-gray-50 rounded-lg p-6 shadow-lg border border-gray-200">
				<h2 className="text-xl font-semibold text-black mb-4">
					Project Impact
				</h2>
				<ImpactCards data={statsDataUpdates} />
			</div>

			<div className="mt-6 bg-gray-50 rounded-lg p-6 shadow-lg border border-gray-200">
				<Timeline events={timelineEvents} />
			</div>

			<div className="mt-6 bg-gray-50 rounded-lg p-6 shadow-lg border border-gray-200">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-xl font-semibold text-black">Success Gallery</h2>
					<button
						type="button"
						onClick={(e) => e.preventDefault()}
						className="text-sm font-medium text-blue-600 hover:underline"
					>
						View All
					</button>
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
					{successGalleryItems.map((item) => (
						<div
							key={item.id}
							className="bg-gray-100 rounded-lg shadow-inner aspect-w-1 aspect-h-1"
						>
							<img
								src={item.src}
								alt={item.alt}
								className="w-full h-full object-cover rounded-lg"
							/>
						</div>
					))}
				</div>
			</div>
		</SectionContainer>
	)
}

export default ProjectUpdatesSection
