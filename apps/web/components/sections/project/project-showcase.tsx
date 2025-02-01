import { useState } from 'react'
import type React from 'react'
import SectionContainer from '~/components/sections/project/section-container'
import SuccessGallery from '~/components/sections/project/success-gallery'
import { showcaseData } from '~/lib/constants/mock-data/mock-projects'

const ProjectShowcaseSection = () => {
	const [lightboxOpen, setLightboxOpen] = useState(false)
	const [selectedMedia, setSelectedMedia] = useState<{
		src: string
		type: string
	} | null>(null)

	const openLightbox = (index: number) => {
		setSelectedMedia(showcaseData[index])
		setLightboxOpen(true)
	}

	const closeLightbox = () => {
		setSelectedMedia(null)
		setLightboxOpen(false)
	}

	return (
		<SectionContainer>
			<SuccessGallery items={showcaseData} onMediaClick={openLightbox} />

			{lightboxOpen && selectedMedia && (
				<div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
					<button
						type="button"
						onClick={closeLightbox}
						className="absolute top-4 right-4 text-white text-2xl font-bold"
					>
						&times;
					</button>
					{selectedMedia.type === 'image' ? (
						<img
							src={selectedMedia.src}
							alt="Showcase"
							className="max-w-full max-h-full rounded-lg"
						/>
					) : (
						<video
							src={selectedMedia.src}
							controls
							className="max-w-full max-h-full rounded-lg"
						>
							<track kind="captions" src="" label="English" />
						</video>
					)}
				</div>
			)}
		</SectionContainer>
	)
}

export default ProjectShowcaseSection
