'use client'

import { motion } from 'framer-motion'
import { Download } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { Button } from '~/components/base/button'
import { FileIcon } from '~/components/sections/projects/detail/file-icon'
import type { ProjectPitch } from '~/lib/types/project/project-detail.types'

interface OverviewTabProps {
	pitch: ProjectPitch
}

export function OverviewTab({ pitch }: OverviewTabProps) {
	return (
		<motion.div
			className="bg-white rounded-xl shadow-sm p-6"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.3 }}
		>
			{/* Project title */}
			<h1 className="text-4xl font-bold mb-6">{pitch.title}</h1>

			{/* Project story section */}
			{pitch.story && (
				<div className="mb-8">
					<div className="prose max-w-none">
						<ReactMarkdown>{pitch.story}</ReactMarkdown>
					</div>
				</div>
			)}

			{/* Video section */}
			{pitch.videoUrl && (
				<div className="mb-8">
					<h2 className="text-2xl font-bold mb-4">Project Video</h2>
					<div className="aspect-video rounded-lg overflow-hidden">
						<iframe
							src={pitch.videoUrl}
							title="Project Video"
							className="w-full h-full"
							allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
							allowFullScreen
							sandbox="allow-same-origin allow-scripts allow-presentation"
						/>
					</div>
				</div>
			)}

			{pitch.pitchDeck && (
				<div className="mb-8">
					<h2 className="text-2xl font-bold mb-4">Project Materials</h2>

					{(() => {
						const url = pitch.pitchDeck
						const fileName = decodeURIComponent(
							url.split('/').pop()?.split('?')[0] ?? 'Project File',
						)
						const extension = fileName.split('.').pop()?.toLowerCase()
						const fileType =
							extension === 'ppt' || extension === 'pptx'
								? 'ppt'
								: extension === 'key'
									? 'key'
									: extension === 'odp'
										? 'odp'
										: 'pdf' // fallback

						return (
							<div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
								<FileIcon
									fileType={fileType}
									className="h-10 w-10 flex-shrink-0"
								/>
								<div className="flex-1 min-w-0 w-full">
									<h3 className="font-medium truncate">{fileName}</h3>
									<p className="text-sm text-muted-foreground uppercase">
										Pitch Deck
									</p>
								</div>
								<Button
									asChild
									size="sm"
									variant="outline"
									className="gradient-border-btn bg-white"
									aria-label={`Download ${fileName}`}
								>
									<a
										href={url}
										download
										target="_blank"
										rel="noopener noreferrer"
									>
										<Download className="h-4 w-4 mr-2" />
										Download
									</a>
								</Button>
							</div>
						)
					})()}
				</div>
			)}
		</motion.div>
	)
}
