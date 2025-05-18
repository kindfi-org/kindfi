'use client'

import type React from 'react'
import { type ReactNode, createContext, useContext, useState } from 'react'

// Definimos los tipos necesarios
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

interface IdentityFormValues {
	fullName: string
	dateOfBirth: Date | string
	nationality: string
}

interface KycData {
	identityInfo: IdentityFormValues
	documentInfo: {
		documentType?: DocumentType
		frontImage?: File | null
		backImage?: File | null
		extractedData?: ExtractedData
	}
	faceVerification: { selfie?: File | string }
	addressInfo: {
		addressDocument?: File | string
		extractedData?: ExtractedData
	}
	finalReview: { confirmed?: boolean }
}

// Definimos el tipo del contexto
interface KycContextType {
	kycData: KycData
	updateKycData: (data: Partial<KycData>) => void
	clearKycData: () => void
}

// Creamos el contexto con un valor inicial undefined
const KycContext = createContext<KycContextType | undefined>(undefined)

// Estado inicial de kycData
const initialKycData: KycData = {
	identityInfo: {
		fullName: '',
		dateOfBirth: '',
		nationality: '',
	},
	documentInfo: {
		documentType: '',
		frontImage: null,
		backImage: null,
		extractedData: undefined,
	},
	faceVerification: {
		selfie: undefined,
	},
	addressInfo: {
		addressDocument: undefined,
		extractedData: undefined,
	},
	finalReview: {
		confirmed: undefined,
	},
}

// Proveedor del contexto
export const KycProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [kycData, setKycData] = useState<KycData>(initialKycData)

	const updateKycData = (data: Partial<KycData>) => {
		setKycData((prev) => ({
			...prev,
			...data,
		}))
	}

	const clearKycData = () => {
		setKycData(initialKycData)
	}

	return (
		<KycContext.Provider value={{ kycData, updateKycData, clearKycData }}>
			{children}
		</KycContext.Provider>
	)
}

// Hook personalizado para usar el contexto
export const useKycContext = (): KycContextType => {
	const context = useContext(KycContext)
	if (!context) {
		throw new Error('useKycContext must be used within a KycProvider')
	}
	return context
}
