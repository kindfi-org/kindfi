'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, Upload, X } from 'lucide-react'
import { useCallback, useState } from 'react'
import { type FileRejection, useDropzone } from 'react-dropzone'
import { Button } from '~/components/base/button'
import { FileIcon } from '~/components/sections/projects/shared'
import { cn } from '~/lib/utils'

interface FileUploadProps {
	value: File | string | null
	onChange: (file: File | null) => void
	error?: string
	accept?: Record<string, string[]>
	maxSize?: number
	label?: string
}

export function FileUpload({
	value,
	onChange,
	error,
	accept = {
		'application/pdf': ['.pdf'],
		'application/vnd.ms-powerpoint': ['.ppt'],
		'application/vnd.openxmlformats-officedocument.presentationml.presentation':
			['.pptx'],
	},
	maxSize = 10 * 1024 * 1024, // 10MB
	label = 'Upload your pitch deck',
}: FileUploadProps) {
	const [uploadError, setUploadError] = useState<string>('')

	const onDrop = useCallback(
		(acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
			setUploadError('')

			if (rejectedFiles.length > 0) {
				const rejection = rejectedFiles[0]
				if (rejection.errors[0]?.code === 'file-too-large') {
					setUploadError(
						`File is too large. Maximum size is ${(maxSize / 1024 / 1024).toFixed(0)}MB`,
					)
				} else if (rejection.errors[0]?.code === 'file-invalid-type') {
					setUploadError(
						'Invalid file type. Please upload PDF, PPT, or PPTX files only.',
					)
				} else {
					setUploadError('File upload failed. Please try again.')
				}
				return
			}

			const file = acceptedFiles[0]
			if (file) {
				onChange(file)
			}
		},
		[onChange, maxSize],
	)

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept,
		maxSize,
		multiple: false,
	})

	const removeFile = () => {
		onChange(null)
		setUploadError('')
	}

	const formatFileSize = (bytes: number) => {
		if (bytes === 0) return '0 Bytes'
		const k = 1024
		const sizes = ['Bytes', 'KB', 'MB', 'GB']
		const i = Math.floor(Math.log(bytes) / Math.log(k))
		return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
	}

	const displayError = error || uploadError

	return (
		<div className="space-y-4">
			<AnimatePresence mode="wait">
				{!value ? (
					<motion.div
						key="upload-area"
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						transition={{ duration: 0.2 }}
					>
						<div
							{...getRootProps()}
							className={cn(
								'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
								{
									'border-blue-400 bg-blue-50': isDragActive,
									'border-gray-300 hover:border-gray-400':
										!isDragActive && !displayError,
									'border-red-300 bg-red-50': displayError,
								},
							)}
						>
							<input {...getInputProps()} aria-label={label} />
							<Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
							<p className="text-lg font-medium text-gray-900 mb-2">
								{isDragActive ? 'Drop your file here' : label}
							</p>
							<p className="text-sm text-gray-500 mb-2">
								Drag and drop or click to select
							</p>
							<p className="text-xs text-gray-400">
								PDF, PPT, PPTX up to {(maxSize / 1024 / 1024).toFixed(0)}MB
							</p>
						</div>
					</motion.div>
				) : (
					<motion.div
						key="file-preview"
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						transition={{ duration: 0.2 }}
					>
						<div className="border border-gray-200 rounded-lg p-4 bg-white">
							<div className="flex items-center gap-4">
								{typeof value === 'string' ? (
									<>
										<FileIcon
											fileType={value.split('.').pop() || ''}
											className="h-8 w-8"
										/>
										<div className="flex-1 min-w-0">
											<h4 className="font-medium truncate">
												{decodeURIComponent(value.split('/').pop() || 'File')}
											</h4>
											<p className="text-sm text-gray-500">Existing file</p>
										</div>
									</>
								) : (
									<>
										<FileIcon
											fileType={value.name.split('.').pop() || ''}
											className="h-8 w-8"
										/>
										<div className="flex-1 min-w-0">
											<h4 className="font-medium truncate">{value.name}</h4>
											<p className="text-sm text-gray-500">
												{formatFileSize(value.size)}
											</p>
										</div>
									</>
								)}
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onClick={removeFile}
									className="text-red-500 hover:text-red-700 hover:bg-red-50"
									aria-label="Remove file"
								>
									<X className="h-4 w-4" />
								</Button>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			<AnimatePresence>
				{displayError && (
					<motion.div
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						transition={{ duration: 0.2 }}
						className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3"
					>
						<AlertCircle className="h-4 w-4 flex-shrink-0" />
						<span>{displayError}</span>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	)
}
