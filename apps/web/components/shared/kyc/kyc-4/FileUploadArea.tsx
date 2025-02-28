import { Upload } from 'lucide-react'
import { useRef } from 'react'
import type { useToast } from '~/components/base/toast'
import { cn } from '~/lib/utils'
import type { DocumentType } from './types'

type documentType = DocumentType

interface FileUploadAreaProps {
	isProcessing: boolean
	documentType: documentType
	handleFileSelect: (
		e: React.ChangeEvent<HTMLInputElement>,
		documentType: string,
		handleFileUploadBound: (file: File) => void,
		setFile: React.Dispatch<React.SetStateAction<File | null>>,
		toast: ReturnType<typeof useToast>['toast'],
	) => void
	handleFileUploadBound: (file: File) => void
	setFile: React.Dispatch<React.SetStateAction<File | null>>
	toast: ReturnType<typeof useToast>['toast']
	handleDrop: (
		e: React.DragEvent<HTMLDivElement>,
		documentType: documentType,
		handleFileUploadBound: (file: File) => void,
		setFile: React.Dispatch<React.SetStateAction<File | null>>,
		toast: ReturnType<typeof useToast>['toast'],
	) => void
}

export const FileUploadArea: React.FC<FileUploadAreaProps> = ({
	isProcessing,
	handleDrop,
	handleFileSelect,
	documentType,
	handleFileUploadBound,
	setFile,
	toast,
}) => {
	const fileUploadRef = useRef<HTMLInputElement | null>(null)

	return (
		<div
			className={cn(
				'border-2 border-dashed rounded-lg p-8 text-center',
				'transition-all duration-300 ease-in-out transform',
				'hover:scale-[1.02] hover:border-black hover:bg-gray-50',
				'hover:shadow-lg cursor-pointer relative',
				{ 'opacity-50 pointer-events-none': isProcessing },
			)}
			onDrop={(e) =>
				handleDrop(e, documentType, handleFileUploadBound, setFile, toast)
			}
			onDragOver={(e) => e.preventDefault()}
			onClick={() => {
				if (isProcessing || !fileUploadRef.current) return
				fileUploadRef.current.click()
			}}
			onKeyUp={(e) => {
				if (isProcessing || !fileUploadRef.current) return
				if (e.key === 'Enter' || e.key === ' ') {
					fileUploadRef.current.click()
				}
			}}
			tabIndex={0}
			role="button"
		>
			<input
				ref={fileUploadRef}
				id="file-upload"
				name="file-upload"
				type="file"
				className="hidden"
				accept=".jpg,.jpeg,.png"
				onChange={(e) =>
					handleFileSelect(
						e,
						documentType,
						handleFileUploadBound,
						setFile,
						toast,
					)
				}
				disabled={isProcessing}
			/>
			<Upload className="mx-auto mb-4 h-12 w-12 text-gray-400" />
			<h3 className="text-lg font-medium">Click to upload or drag and drop</h3>
			<p className="text-sm text-gray-500">JPG or PNG images only</p>
		</div>
	)
}
