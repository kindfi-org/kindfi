'use client'

import { motion } from 'framer-motion'
import { Download } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { Button } from '~/components/base/button'
import { FileIcon } from '~/components/sections/project-detail/file-icon'
import type { ProjectDetail } from '~/lib/types/project/project-detail.types'

interface OverviewTabProps {
	project: ProjectDetail
}

export function OverviewTab({ project }: OverviewTabProps) {
	return (
		<motion.div
			className="bg-white rounded-xl shadow-sm p-6"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.3 }}
		>
			{/* Project story section */}
			<div className="mb-8">
				<div className="prose max-w-none">
					<ReactMarkdown>{project.story}</ReactMarkdown>
				</div>
			</div>

			{/* Video section */}
			{project.pitchVideo && (
				<div className="mb-8">
					<h2 className="text-2xl font-bold mb-4">Project Video</h2>
					<div className="aspect-video rounded-lg overflow-hidden">
						<iframe
							src={project.pitchVideo}
							title="Project Video"
							className="w-full h-full"
							allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
							allowFullScreen
							sandbox="allow-same-origin allow-scripts allow-presentation"
						/>
					</div>
				</div>
			)}

			{/* Pitch files section */}
			{project.pitchFiles && project.pitchFiles.length > 0 && (
				<div className="mb-8">
					<h2 className="text-2xl font-bold mb-4">Project Materials</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{project.pitchFiles.map((file) => (
							<div
								key={file.id}
								className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
							>
								<FileIcon
									fileType={file.type}
									className="h-10 w-10 flex-shrink-0"
								/>
								<div className="flex-1 min-w-0 w-full">
									<h3 className="font-medium truncate">{file.name}</h3>
									<p className="text-sm text-muted-foreground">
										{file.type.toUpperCase()} •{' '}
										{(file.size / 1000000).toFixed(1)} MB
									</p>
								</div>
								<Button
									asChild
									size="sm"
									variant="outline"
									className="w-full sm:w-auto flex-shrink-0 gradient-border-btn"
									aria-label={`Download ${file.name} (${file.type.toUpperCase()})`}
								>
									<a
										href={file.url}
										download
										target="_blank"
										rel="noopener noreferrer"
										aria-label={`Download ${file.name} (${file.type.toUpperCase()})`}
									>
										<Download className="h-4 w-4 mr-2" aria-hidden="true" />
										Download
									</a>
								</Button>
							</div>
						))}
					</div>
				</div>
			)}
		</motion.div>
	)
}
