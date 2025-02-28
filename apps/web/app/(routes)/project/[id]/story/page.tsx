import { Save } from 'lucide-react'
import { Button } from '../../../../../components/base/button'
import { ProjectMedia } from '../../../../../components/sections/project/project-media'
import { ProjectStoryForm } from '../../../../../components/sections/project/project-story'
import { ProjectTips } from '../../../../../components/sections/project/project-tips'
import type { ProjectStory } from '../../../../../lib/validators/project'

export default function ProjectPitchPage() {
	const handleStorySubmit = (data: ProjectStory) => {
		// TODO: Implement story submission
		console.log('Story submitted:', data)
	}

	const handleFileUpload = async (file: File) => {
		// Simulating an asynchronous file upload
		await new Promise((resolve) => setTimeout(resolve, 1000))
		console.log("File uploaded:", file.name)
		// TODO: Implement actual file upload logic here
	  }

	const handleVideoUrlChange = (url: string) => {
		// TODO: Implement video URL update
		console.log('Video URL updated:', url)
	}

	const handleSaveAll = () => {
		// TODO: Implement saving all changes
		console.log('Saving all changes')
	}

	return (
		<div className="container mx-auto py-8">
			<h1 className="text-3xl font-bold mb-8">Project Pitch & Story</h1>
			<p className="text-gray-600 mb-8">
				Tell your story and explain why donors should support your project
			</p>

			<div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
				<div className="lg:col-span-3">
					<div className="space-y-8">
						<ProjectStoryForm onSubmit={handleStorySubmit} />
						<ProjectMedia
							onFileUpload={handleFileUpload}
							onVideoUrlChange={handleVideoUrlChange}
						/>
					</div>
					<div className="mt-8 flex justify-end">
						<Button
							onClick={handleSaveAll}
							className="bg-black hover:bg-black/90 text-white"
						>
							<Save className="w-4 h-4 mr-1" />
							Save Changes
						</Button>
					</div>
				</div>

				<aside className="lg:col-span-1 relative">
					<ProjectTips />
				</aside>
			</div>
		</div>
	)
}
