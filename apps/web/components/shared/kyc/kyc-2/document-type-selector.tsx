'use client'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '~/components/base/select'
import type { DocumentType } from './types'

interface DocumentTypeSelectorProps {
	value: DocumentType
	onChange: (value: DocumentType) => void
}

export function DocumentTypeSelector({
	value,
	onChange,
}: DocumentTypeSelectorProps) {
	return (
		<div className="space-y-2">
			<label htmlFor="document-type" className="text-lg font-medium">
				ID Document Type
			</label>
			<Select value={value} onValueChange={onChange}>
				<SelectTrigger id="document-type" className="w-full">
					<SelectValue placeholder="Select ID document type" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="Passport">Passport</SelectItem>
					<SelectItem value="National ID">National ID</SelectItem>
					<SelectItem value="Driver's License">Driver's License</SelectItem>
				</SelectContent>
			</Select>
		</div>
	)
}
