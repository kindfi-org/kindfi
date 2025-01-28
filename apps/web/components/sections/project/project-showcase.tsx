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
		alt?: string
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
				<div
					aria-modal="true"
					aria-label="Media Preview"
					className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
				>
					<button
						type="button"
						onClick={closeLightbox}
						className="absolute top-4 right-4 text-white text-2xl font-bold p-2"
						aria-label="Close preview"
					>
						&times;
					</button>
					{selectedMedia.type === 'image' ? (
						<img
							src={selectedMedia.src}
							alt={selectedMedia.alt || 'Showcase content'}
							className="max-w-full max-h-full rounded-lg"
						/>
					) : (
						<div className="relative">
							<video
								src={selectedMedia.src}
								controls
								className="max-w-full max-h-full rounded-lg"
							>
								<track
									kind="captions"
									src={`/captions/${selectedMedia.src
										.split('/')
										.pop()
										?.replace(/\.[^/.]+$/, '')}.vtt`}
									srcLang="en"
									label="English"
									default
								/>
								Your browser does not support the video element.
							</video>
							<div className="mt-2 text-white text-center">
								<p className="text-sm">
									Captions will be displayed here when available
								</p>
							</div>
						</div>
					)}
				</div>
			)}
		</SectionContainer>
	)
}

export default ProjectShowcaseSection
