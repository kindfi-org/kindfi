import type { DocumentType } from '@packages/lib'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '~/components/base/select'

interface DocumentTypeSelectorProps {
	documentType: DocumentType
	setDocumentType: (value: DocumentType) => void
}

export const DocumentTypeSelector: React.FC<DocumentTypeSelectorProps> = ({
	documentType,
	setDocumentType,
}) => (
	<div className="space-y-2">
		<label htmlFor="document-type" className="text-lg font-medium">
			Document Type
		</label>
		<Select
			value={documentType}
			onValueChange={(value: DocumentType) => setDocumentType(value)}
		>
			<SelectTrigger id="document-type" className="w-full">
				<SelectValue placeholder="Select document type" />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="utility">Utility Bill</SelectItem>
				<SelectItem value="bank">Bank Statement</SelectItem>
				<SelectItem value="government">Government ID</SelectItem>
			</SelectContent>
		</Select>
		<p className="text-sm text-gray-500">
			Choose the type of document you&apos;ll be uploading
		</p>
	</div>
)
