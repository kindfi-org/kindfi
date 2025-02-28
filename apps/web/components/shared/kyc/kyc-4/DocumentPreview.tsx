import { Loader2, X } from 'lucide-react'
import type React from 'react'
import type { ExtractedData } from './types'

interface DocumentPreviewProps {
	isProcessing: boolean
	progress: number
	previewUrl: string | null
	removeFile: () => void
	setFile: React.Dispatch<React.SetStateAction<File | null>>
	setPreviewUrl: React.Dispatch<React.SetStateAction<string | null>>
	setExtractedData: React.Dispatch<React.SetStateAction<ExtractedData | null>>
	setValidationErrors: React.Dispatch<React.SetStateAction<string[]>>
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
	isProcessing,
	progress,
	previewUrl,
	removeFile,
	setFile,
	setPreviewUrl,
	setExtractedData,
	setValidationErrors,
}) => {
	return (
		<div className="relative border rounded-lg overflow-hidden">
			{isProcessing && (
				<div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center">
					<Loader2 className="h-12 w-12 animate-spin text-white mb-4" />
					<div className="w-64 bg-gray-200 rounded-full h-2.5">
						<div
							className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
							style={{ width: `${progress}%` }}
						/>
					</div>
					<p className="text-white mt-2">Processing... {progress}%</p>
				</div>
			)}
			<button
				type="button"
				onClick={() => {
					removeFile()
					setFile(null)
					setPreviewUrl(null)
					setExtractedData(null)
					setValidationErrors([])
				}}
				aria-label="Remove uploaded file"
				className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-all"
			>
				<X className="h-5 w-5" />
			</button>
			{previewUrl && (
				<img
					src={previewUrl}
					alt="Document preview"
					className="w-full h-auto max-h-[400px] object-contain"
				/>
			)}
		</div>
	)
}
