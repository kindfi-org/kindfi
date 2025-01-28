import { useState } from 'react'
import type React from 'react'
import { FaBullseye, FaCheckCircle, FaGlobe, FaUsers } from 'react-icons/fa'
import AboutProject from '~/components/sections/project/about-project'
import SectionContainer from '~/components/sections/project/section-container'
import {
	aboutProjectProps,
	successGalleryItems,
} from '~/lib/constants/mock-data/mock-projects'

type IconKey = 'target' | 'user' | 'language' | 'status'

const ICONS: Record<IconKey, React.JSX.Element> = {
	target: <FaBullseye color="#4F46E5" />,
	user: <FaUsers color="#4F46E5" />,
	language: <FaGlobe color="#4F46E5" />,
	status: <FaCheckCircle color="#4F46E5" />,
}

const ProjectOverview = () => {
	const [mediaList, setMediaList] = useState(successGalleryItems)
	const [currentFocus, setCurrentFocus] = useState<number>(-1)

	const handleMediaSelect = (index: number) => {
		if (index === 0) return

		const currentList = [...mediaList]
		const [selectedImage] = currentList.splice(index, 1)
		const reorderedList = [
			selectedImage,
			...currentList.filter((item) => item !== selectedImage),
		]
		setMediaList(reorderedList)
	}

	const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault()
			handleMediaSelect(index)
		} else if (e.key === 'ArrowLeft') {
			e.preventDefault()
			const newIndex = index > 1 ? index - 1 : mediaList.length - 1
			setCurrentFocus(newIndex)
		} else if (e.key === 'ArrowRight') {
			e.preventDefault()
			const newIndex = index < mediaList.length - 1 ? index + 1 : 1
			setCurrentFocus(newIndex)
		}
	}

	return (
		<SectionContainer>
			<div className="relative w-full h-[500px] bg-gray-100 rounded-lg overflow-hidden mb-10">
				<div className="absolute inset-4 flex items-center justify-center shadow-lg rounded-lg">
					<img
						src={mediaList[0]?.src}
						alt={mediaList[0]?.alt || 'Main project image'}
						className="w-full h-full object-cover rounded-lg"
					/>
				</div>
				<div
					className="absolute bottom-8 left-8 flex space-x-2"
					aria-label="Project image thumbnails"
				>
					{mediaList.map((item, index) =>
						index > 0 ? (
							<button
								key={item.id} // Assuming each MediaItem has a unique id
								type="button"
								onClick={() => handleMediaSelect(index)}
								onKeyDown={(e) => handleKeyDown(e, index)}
								onFocus={() => setCurrentFocus(index)}
								className={`p-0 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded ${
									currentFocus === index ? 'ring-2 ring-blue-500' : ''
								}`}
								aria-label={`Select ${item.alt || `image ${index}`} as main image`}
							>
								<img
									src={item.src}
									alt=""
									className="w-24 h-24 rounded object-cover cursor-pointer transition-transform transform hover:scale-105 shadow-sm"
								/>
							</button>
						) : null,
					)}
				</div>
			</div>
			<div className="mt-6">
				<AboutProject
					{...aboutProjectProps}
					highlights={aboutProjectProps.highlights.map((highlight) => ({
						...highlight,
						icon: ICONS[highlight.icon as IconKey],
					}))}
				/>
			</div>
		</SectionContainer>
	)
}

export default ProjectOverview
