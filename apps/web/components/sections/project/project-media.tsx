'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { File, Upload, X } from 'lucide-react'
import { useCallback, useState } from 'react'
import { type FileRejection, useDropzone } from 'react-dropzone'
import { Card } from '~/components/base/card'
import { Input } from '~/components/base/input'

interface ProjectMediaProps {
	onFileUpload: (file: File) => Promise<void>
	onVideoUrlChange: (url: string) => void
	videoUrl?: string
	initialFile?: File | null
}

// Vibration animation for error message
const errorAnimation = {
	initial: { x: 0 },
	animate: {
		x: [-2, 2, -2, 2, 0],
		transition: { duration: 0.4 },
	},
}
export function ProjectMedia({
	onFileUpload,
	onVideoUrlChange,
	videoUrl = '',
	initialFile = null,
}: ProjectMediaProps) {
	const [uploadedFile, setUploadedFile] = useState<File | null>(initialFile)
	const [error, setError] = useState<string | null>(null)
	const [isUploading, setIsUploading] = useState(false)
	const [uploadProgress, setUploadProgress] = useState(0)

	const handleRemoveFile = () => {
		setUploadedFile(null)
		setError(null)
	}

	const onDrop = useCallback(
		async (acceptedFiles: File[]) => {
			const file = acceptedFiles[0]
			if (file) {
				setIsUploading(true)
				setUploadProgress(0)
				setError(null) // Clear error message immediately when a valid file is dropped
				try {
					// Simulate progress updates
					const progressInterval = setInterval(() => {
						setUploadProgress((prev) => {
							const newProgress = prev + 5
							if (newProgress >= 95) {
								clearInterval(progressInterval)
								return 95
							}
							return newProgress
						})
					}, 100)

					await onFileUpload(file)

					// Clear interval and set to 100% when upload is complete
					clearInterval(progressInterval)
					setUploadProgress(100)
					setUploadedFile(file)
					setError(null)
				} catch (_err) {
					setError('Failed to upload file. Please try again.')
					setUploadProgress(0)
				} finally {
					setIsUploading(false)
				}
			}
		},
		[onFileUpload],
	)

	const onDropRejected = useCallback((fileRejections: FileRejection[]) => {
		const rejection = fileRejections[0]
		if (rejection?.errors[0]?.code === 'file-too-large') {
			setError('File size exceeds 10MB limit')
		} else {
			setError('Invalid file. Please upload a PDF or PowerPoint file.')
		}
	}, [])

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		onDropRejected,
		accept: {
			'application/pdf': ['.pdf'],
			'application/vnd.openxmlformats-officedocument.presentationml.presentation':
				['.pptx'],
		},
		maxFiles: 1,
		maxSize: 10 * 1024 * 1024, // 10MB
	})

	const truncateFileName = (name: string, maxLength: number) => {
		if (name.length <= maxLength) return name
		const extension = name.split('.').pop()
		const nameWithoutExtension = name.slice(0, name.lastIndexOf('.'))
		const truncatedName = nameWithoutExtension.slice(
			0,
			maxLength - 3 - (extension?.length || 0),
		)
		return `${truncatedName}...${extension}`
	}

	return (
		<Card className="p-6 shadow-md hover:shadow-lg transition-shadow">
			<h3 className="text-xl font-semibold mb-4">Media & Attachments</h3>
			<div className="space-y-6">
				<div>
					<h4 className="font-medium mb-2">Pitch Deck</h4>
					<AnimatePresence mode="wait">
						{uploadedFile ? (
							<motion.div
								key="uploaded"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -20 }}
								className="border rounded-lg p-4"
							>
								<div className="flex flex-wrap items-center justify-between gap-2">
									<div className="flex items-center gap-2 min-w-0 flex-1">
										<File className="w-5 h-5 shrink-0 text-blue-500" />
										<span className="truncate">
											<span className="sm:hidden">
												{truncateFileName(uploadedFile.name, 20)}
											</span>
											<span className="hidden sm:inline md:hidden">
												{truncateFileName(uploadedFile.name, 40)}
											</span>
											<span className="hidden md:inline">
												{truncateFileName(uploadedFile.name, 60)}
											</span>
										</span>
									</div>
									<div className="flex items-center gap-2 shrink-0">
										<span className="text-sm text-gray-500">
											({(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB)
										</span>
										<motion.button
											whileHover={{ scale: 1.1 }}
											whileTap={{ scale: 0.9 }}
											onClick={handleRemoveFile}
											className="p-1"
										>
											<X className="w-4 h-4" />
										</motion.button>
									</div>
								</div>
							</motion.div>
						) : (
							<motion.div
								key="dropzone"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -20 }}
							>
								<div
									{...getRootProps()}
									className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
										isDragActive
											? 'border-blue-500 bg-blue-50'
											: 'border-gray-300 hover:border-gray-400'
									}`}
								>
									<input {...getInputProps()} />
									<AnimatePresence>
										{isDragActive ? (
											<motion.p
												key="drag-active"
												initial={{ opacity: 0, y: 10 }}
												animate={{ opacity: 1, y: 0 }}
												exit={{ opacity: 0, y: -10 }}
												className="text-blue-500 font-medium"
											>
												Drop the file here...
											</motion.p>
										) : (
											<motion.p
												key="drag-inactive"
												initial={{ opacity: 0, y: 10 }}
												animate={{ opacity: 1, y: 0 }}
												exit={{ opacity: 0, y: -10 }}
												className="text-gray-600"
											>
												Drag & drop your pitch deck here, or click to select
											</motion.p>
										)}
									</AnimatePresence>
									<p className="text-sm text-gray-500 mt-1">
										PDF or PowerPoint, max 10MB
									</p>
								</div>
							</motion.div>
						)}
					</AnimatePresence>
					{isUploading && (
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -20 }}
							className="mt-2"
						>
							<div className="flex items-center gap-2">
								<Upload className="w-4 h-4 text-blue-500 animate-bounce" />
								<span className="text-sm text-gray-600">Uploading...</span>
							</div>
							<div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
								<motion.div
									className="bg-blue-500 h-2.5 rounded-full"
									initial={{ width: 0 }}
									animate={{ width: `${uploadProgress}%` }}
									transition={{ duration: 0.5 }}
								/>
							</div>
						</motion.div>
					)}
					<AnimatePresence>
						{error && (
							<motion.p
								key="error"
								variants={errorAnimation}
								initial="initial"
								animate="animate"
								className="text-sm text-red-500 mt-1"
							>
								{error}
							</motion.p>
						)}
					</AnimatePresence>
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
