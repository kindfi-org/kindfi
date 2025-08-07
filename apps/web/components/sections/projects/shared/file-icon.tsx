import { FileIcon as FilePresentation, FileText } from 'lucide-react'
import { cn } from '~/lib/utils'

interface FileIconProps {
	fileType: string
	className?: string
}

export function FileIcon({ fileType, className }: FileIconProps) {
	switch (fileType.toLowerCase()) {
		case 'pdf':
			return (
				<div className="bg-red-100 text-red-700 p-2 rounded-lg">
					<FileText className={cn('h-6 w-6', className)} />
				</div>
			)
		case 'ppt':
		case 'pptx':
			return (
				<div className="bg-orange-100 text-orange-700 p-2 rounded-lg">
					<FilePresentation className={cn('h-6 w-6', className)} />
				</div>
			)
		default:
			return (
				<div className="bg-gray-100 text-gray-700 p-2 rounded-lg">
					<FileText className={cn('h-6 w-6', className)} />
				</div>
			)
	}
}
