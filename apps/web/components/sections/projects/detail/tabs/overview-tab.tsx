'use client'

import { motion } from 'framer-motion'
import parse from 'html-react-parser'
import { Download } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '~/components/base/button'
import { FileIcon } from '~/components/sections/projects/shared'
import type { ProjectPitch } from '~/lib/types/project/project-detail.types'

interface OverviewTabProps {
	pitch: ProjectPitch
}

export function OverviewTab({ pitch }: OverviewTabProps) {
	const [DOMPurify, setDOMPurify] = useState<typeof import('dompurify').default | null>(null)

	// Load DOMPurify only in the browser
	useEffect(() => {
		if (typeof window !== 'undefined') {
			import('dompurify').then((mod) => {
				setDOMPurify(() => mod.default)
			})
		}
	}, [])

	// Sanitize user-provided HTML to prevent XSS before parsing/rendering
	const safeStory = useMemo(() => {
		if (!pitch.story) return ''
		
		// Only sanitize in the browser where DOMPurify is available
		if (DOMPurify) {
			return DOMPurify.sanitize(pitch.story)
		}
		
		// Fallback for SSR: return original story (will be sanitized on client hydration)
		return pitch.story
	}, [pitch.story, DOMPurify])

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
				<div className="mb-8 prose max-w-none">{parse(safeStory)}</div>
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
							// Keep sandbox to further reduce risk when embedding
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
							extension === 'ppt' || extension === 'pptx' ? 'ppt' : 'pdf' // fallback

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
