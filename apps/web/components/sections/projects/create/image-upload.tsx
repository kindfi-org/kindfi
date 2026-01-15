'use client'

import { ImageIcon, Upload, X } from 'lucide-react'
import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'

import { Button } from '~/components/base/button'
import { cn } from '~/lib/utils'

interface ImageUploadProps {
	value: File | string | null
	onChange: (file: File | null) => void
	error?: string
}

export function ImageUpload({ value, onChange, error }: ImageUploadProps) {
	const [preview, setPreview] = useState<string | null>(null)

	const onDrop = useCallback(
		(acceptedFiles: File[]) => {
			const file = acceptedFiles[0]
			if (file) {
				onChange(file)
				const reader = new FileReader()
				reader.onload = () => setPreview(reader.result as string)
				reader.onerror = () => {
					console.error('Error reading file')
					setPreview(null)
				}
				reader.readAsDataURL(file)
			}
		},
		[onChange],
	)

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: {
			'image/jpeg': ['.jpg', '.jpeg'],
			'image/png': ['.png'],
			'image/webp': ['.webp'],
		},
		maxSize: 5 * 1024 * 1024, // 5MB
		multiple: false,
	})

	const removeImage = () => {
		onChange(null)
		setPreview(null)
	}

	// Mostrar preview si value es una URL o si ya hay un File
	useEffect(() => {
		if (typeof value === 'string') {
			// Use setTimeout to avoid React Compiler warning about setState in effect
			const timer = setTimeout(() => {
				setPreview(value)
			}, 0)
			return () => clearTimeout(timer)
		}
		if (value instanceof File) {
			const reader = new FileReader()
			reader.onload = () => setPreview(reader.result as string)
			reader.onerror = () => {
				console.error('Error reading file')
				setPreview(null)
			}
			reader.readAsDataURL(value)
			// Cleanup function to abort reading if component unmounts or value changes
			return () => {
				reader.abort()
			}
		}
		// Use setTimeout to avoid React Compiler warning about setState in effect
		const timer = setTimeout(() => {
			setPreview(null)
		}, 0)
		return () => clearTimeout(timer)
	}, [value])

	return (
		<div className="space-y-4">
			{!value ? (
				<div
					{...getRootProps()}
					className={cn(
						'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
						{
							'border-blue-400 bg-blue-50': isDragActive,
							'border-gray-300 hover:border-gray-400': !isDragActive && !error,
							'border-red-300 bg-red-50': error,
						},
					)}
				>
					<input
						{...getInputProps()}
						aria-label="Upload project image. Accepts JPEG, PNG, WebP files up to 5MB"
						aria-describedby="upload-instructions"
					/>
					<Upload
						className="mx-auto h-12 w-12 text-gray-400 mb-4"
						aria-hidden="true"
					/>
					<p className="text-lg font-medium text-gray-900 mb-2">
						{isDragActive ? 'Drop your image here' : 'Upload project image'}
					</p>
					<p className="text-sm text-gray-500">
						Drag and drop or click to select
					</p>
					<p id="upload-instructions" className="text-xs text-gray-400 mt-2">
						JPEG, PNG, WebP up to 5MB
					</p>
				</div>
			) : (
				<div className="relative">
					<div className="relative rounded-lg overflow-hidden border border-gray-200">
						{preview ? (
							<Image
								src={preview}
								alt="Project preview"
								width={400}
								height={192}
								className="w-full h-64 object-cover bg-gray-50 rounded-md"
								unoptimized={
									preview.startsWith('data:') || preview.startsWith('http')
								}
							/>
						) : (
							<div className="w-full h-64 bg-gray-100 flex items-center justify-center">
								<ImageIcon className="h-12 w-12 text-gray-400" />
							</div>
						)}
						<Button
							type="button"
							variant="destructive"
							size="sm"
							className="absolute top-2 right-2"
							onClick={removeImage}
							aria-label="Remove image"
						>
							<X className="h-4 w-4" />
						</Button>
					</div>
					{value instanceof File && (
						<p className="text-sm text-muted-foreground mt-2">
							{value.name} ({(value.size / 1024 / 1024).toFixed(2)} MB)
						</p>
					)}
				</div>
			)}
			{error && <p className="text-sm text-destructive">{error}</p>}
		</div>
	)
}
