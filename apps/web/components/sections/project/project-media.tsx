'use client'

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card } from '~/components/base/card'
import { Input } from '~/components/base/input'

interface ProjectMediaProps {
	onFileUpload: (file: File) => void
	onVideoUrlChange: (url: string) => void
	videoUrl?: string
}

export function ProjectMedia({
	onFileUpload,
	onVideoUrlChange,
	videoUrl = '',
}: ProjectMediaProps) {
	const onDrop = useCallback(
		(acceptedFiles: File[]) => {
			const file = acceptedFiles[0]
			if (file && file.size <= 10 * 1024 * 1024) {
				// 10MB limit
				onFileUpload(file)
			}
		},
		[onFileUpload],
	)

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: {
			'application/pdf': ['.pdf'],
			'application/vnd.openxmlformats-officedocument.presentationml.presentation':
				['.pptx'],
		},
		maxFiles: 1,
		maxSize: 10 * 1024 * 1024, // 10MB
	})

	return (
		<Card className="p-6 shadow-md hover:shadow-lg transition-shadow">
			<h3 className="text-xl font-semibold mb-4">Media & Attachments</h3>
			<div className="space-y-6">
				<div>
					<h4 className="font-medium mb-2">Pitch Deck</h4>
					<div
						{...getRootProps()}
						className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
							isDragActive
								? 'border-blue-500 bg-blue-50'
								: 'border-gray-300 hover:border-gray-400'
						}`}
					>
						<input {...getInputProps()} />
						<p className="text-gray-600">
							{isDragActive
								? 'Drop the file here...'
								: 'Drag & drop your pitch deck here, or click to select'}
						</p>
						<p className="text-sm text-gray-500 mt-1">
							PDF or PowerPoint, max 10MB
						</p>
					</div>
				</div>

				<div>
					<h4 className="font-medium mb-2">Video URL</h4>
					<Input
						type="url"
						placeholder="Enter URL to your pitch video (YouTube, Vimeo, etc.)"
						value={videoUrl}
						onChange={(e) => onVideoUrlChange(e.target.value)}
						className="w-full"
					/>
					<p className="text-sm text-gray-500 mt-1">
						Optional: Add a video to enhance your pitch
					</p>
				</div>
			</div>
		</Card>
	)
}
