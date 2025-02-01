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

	const handleThumbnailClick = (index: number) => {
		if (index === 0) return

		const currentList = [...mediaList]
		const [selectedImage] = currentList.splice(index, 1)
		const reorderedList = [
			selectedImage,
			...currentList.filter((item) => item !== selectedImage),
		]
		setMediaList(reorderedList)
	}

	return (
		<SectionContainer>
			<div className="relative w-full h-[500px] bg-gray-100 rounded-lg overflow-hidden mb-10">
				<div className="absolute inset-4 flex items-center justify-center shadow-lg rounded-lg">
					<img
						src={mediaList[0]?.src}
						alt={mediaList[0]?.alt}
						className="w-full h-full object-cover rounded-lg"
					/>
				</div>
				<div className="absolute bottom-8 left-8 flex space-x-2">
					{mediaList.map((item, index) =>
						index > 0 ? (
							<button
								type="button"
								key={item.id}
								className="w-24 h-24 rounded object-cover cursor-pointer transition-transform transform hover:scale-105 shadow-sm"
								onClick={() => handleThumbnailClick(index)}
								onKeyDown={(e) =>
									e.key === 'Enter' && handleThumbnailClick(index)
								}
								aria-label={`Click to view ${item.alt}`}
							>
								<img
									src={item.src}
									alt={item.alt}
									className="w-full h-full rounded-full"
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
