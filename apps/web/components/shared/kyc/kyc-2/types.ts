export interface ExtractedData {
	text: string
	idNumber: string | null
	expiryDate: string | null
	fullName: string | null
	documentNumber?: string | null
	nationality?: string | null
	birthDate?: string | null
	issueDate?: string | null
	issuingAuthority?: string | null
	vehicleClass?: string | null
	originalFileType?: string
}

export type ToastType = {
	title: string
	description?: string
	duration?: number
	className?: string
}

export const DocumentPatterns = {
	Passport: {
		idNumber: /[A-Z][0-9]{8}/i,
		name: /([A-Z][a-z]+\s+){1,2}[A-Z][a-z]+/,
		date: /\d{2}[\s./-]\d{2}[\s./-]\d{4}/,
		nationality: /NATIONALITY[\s:]+([A-Z]+)/i,
	},
	'National ID': {
		idNumber: /\d{8}[A-Z]/i,
		name: /([A-Z][a-z]+\s+){1,2}[A-Z][a-z]+/,
		date: /\d{2}[\s./-]\d{2}[\s./-]\d{4}/,
	},
	"Driver's License": {
		idNumber: /[A-Z]\d{7}[A-Z]/i,
		name: /([A-Z][a-z]+\s+){1,2}[A-Z][a-z]+/,
		date: /\d{2}[\s./-]\d{2}[\s./-]\d{4}/,
		vehicleClass: /CLASS[\s:]+([A-Z0-9,\s]+)/i,
	},
} as const

export type DocumentType = keyof typeof DocumentPatterns | ''

export interface IDDocumentUploadProps {
	onBack?: () => void
	onNext?: (data: {
		documentType: DocumentType
		extractedData: ExtractedData
		frontImage: File | null
		backImage: File | null
	}) => void
}

export type ToastFunction = (props: ToastType) => void

export interface AddressSubmitData {
	extractedData?: {
		address?: {
			street?: string
			city?: string
			country?: string
		}
	}
	file: File | null
}