'use client'
import { Upload, X } from 'lucide-react'
import Image from 'next/image'
import { useRef } from 'react'
import { cn } from '~/lib/utils'

interface DocumentUploadZoneProps {
	side: 'front' | 'back'
	previewUrl: string | null
	isProcessing: boolean
	progress?: number
	onDrop: (e: React.DragEvent<HTMLElement>) => void
	onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
	onRemove: () => void
	isDisabled?: boolean
}

export function DocumentUploadZone({
	side,
	previewUrl,
	isProcessing,
	progress = 0,
	onDrop,
	onFileSelect,
	onRemove,
	isDisabled = false,
}: DocumentUploadZoneProps) {
	const fileUploadRef = useRef<HTMLInputElement | null>(null)

	return (
		<div className="space-y-2">
			<label htmlFor="file-upload" className="text-lg font-medium">
				{side === 'front' ? 'Front' : 'Back'} of ID
			</label>
			<input
				id="file-upload"
				ref={fileUploadRef}
				type="file"
				style={{ display: 'none' }}
				accept=".jpg,.jpeg,.png,.pdf"
				onChange={onFileSelect}
				disabled={isProcessing || isDisabled}
			/>
			{!previewUrl ? (
				<div onDrop={onDrop} onDragOver={(e) => e.preventDefault()}>
					<button
						type="button"
						className={cn(
							'flex flex-col items-center justify-center h-52 w-full',
							'border-2 border-dashed rounded-lg p-4 text-center',
							'transition-all duration-300 ease-in-out transform',
							'hover:scale-[1.02] hover:border-black hover:bg-gray-50',
							'hover:shadow-lg cursor-pointer relative',
							{
								'opacity-50 pointer-events-none': isProcessing || isDisabled,
								'cursor-not-allowed': isDisabled,
							},
							`border-${isDisabled ? 'gray-300' : 'black'} border-2 cursor-${isDisabled ? 'not-allowed' : 'pointer'}`,
						)}
						onClick={() => !isDisabled && fileUploadRef.current?.click()}
						disabled={isDisabled}
					>
						<Upload
							className={cn(
								'mx-auto h-12 w-12',
								isDisabled ? 'text-gray-300' : 'text-gray-400',
							)}
						/>
						<h3
							className={cn(
								'text-lg font-medium',
								isDisabled ? 'text-gray-400' : 'text-gray-700',
							)}
						>
							{isDisabled
								? 'Select document type first'
								: 'Click to upload or drag and drop'}
						</h3>
						<p
							className={cn(
								'text-sm',
								isDisabled ? 'text-gray-300' : 'text-gray-500',
							)}
						>
							JPG or PDF files only
						</p>
					</button>
				</div>
			) : (
				<div className="relative border rounded-lg overflow-hidden h-52">
					{!isProcessing && (
						<button
							type="button"
							onClick={onRemove}
							className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 rounded-full z-10"
						>
							<X className="h-4 w-4 text-white" />
						</button>
					)}
					<div className="w-full h-52 relative">
						<Image
							width={400}
							height={400}
							src={previewUrl}
							alt={`${side} of ID`}
							className="absolute w-full h-full object-contain"
						/>
						{isProcessing && (
							<div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center">
								<div className="w-64 h-3 bg-white/20 rounded-full mb-2 overflow-hidden">
									<div
										className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-green-400 to-blue-500"
										style={{ width: `${progress}%` }}
									/>
								</div>
								<p className="text-white text-sm">Processing... {progress}%</p>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	)
}
