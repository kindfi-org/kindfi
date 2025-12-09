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
		// Flexible passport number patterns - accepts various formats
		idNumber:
			/(?:PASSPORT|PASSPORT\s*NO|PASSPORT\s*NUMBER|P\s*NO|P\s*NUMBER)[\s:]*([A-Z0-9]{6,12})|([A-Z]{1,2}[0-9]{6,9})|([0-9]{9})/i,
		// Flexible name patterns - handles all caps, mixed case
		name: /(?:SURNAME|LAST\s*NAME|FAMILY\s*NAME)[\s:]*([A-Z\s]{3,40})|(?:GIVEN\s*NAMES|FIRST\s*NAME|FORENAMES)[\s:]*([A-Z\s]{3,40})|([A-Z][A-Z\s]{5,50})/i,
		// Date patterns - various formats
		date: /\d{1,2}[\s./-]\d{1,2}[\s./-]\d{2,4}|\d{4}[\s./-]\d{1,2}[\s./-]\d{1,2}/,
		// Flexible nationality patterns
		nationality:
			/(?:NATIONALITY|NAT)[\s:]*([A-Z]{2,3})|([A-Z]{2,3})(?:\s*NATIONALITY)/i,
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
