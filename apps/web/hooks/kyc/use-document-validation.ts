'use client'
import { useCallback, useState } from 'react'
import {
	DocumentPatterns,
	type DocumentType,
	type ExtractedData,
} from '~/components/shared/kyc/kyc-2/types'

export function useDocumentValidation(documentType: DocumentType) {
	const [validationErrors, setValidationErrors] = useState<string[]>([])

	const validateDocument = useCallback(
		(data: ExtractedData): { isValid: boolean; errors: string[] } => {
			const errors: string[] = []

			if (!data.idNumber) {
				errors.push('No ID number found in the document')
			}

			if (!data.fullName) {
				errors.push('No full name found in the document')
			}

			if (data.expiryDate) {
				const expiryDate = new Date(`${data.expiryDate}T23:59:59Z`)
				const today = new Date()
				today.setHours(0, 0, 0, 0)
				if (expiryDate < today) {
					errors.push('ID document has expired')
				}
			} else {
				errors.push('No expiry date found in the document')
			}

			switch (documentType) {
				case 'Passport':
					// For passports, make validation less strict - show warnings but don't block
					// Users can verify manually if OCR didn't extract perfectly
					if (!data.nationality) {
						errors.push(
							'No nationality information found (please verify manually)',
						)
					}
					// Only validate format if idNumber exists
					if (
						data.idNumber &&
						!DocumentPatterns.Passport.idNumber.test(data.idNumber)
					) {
						// Try alternative patterns before marking as invalid
						const alternativePatterns = [
							/[A-Z0-9]{6,12}/i,
							/[A-Z]{1,2}[0-9]{6,9}/,
							/[0-9]{9}/,
						]
						const isValidFormat = alternativePatterns.some((pattern) =>
							pattern.test(data.idNumber!),
						)
						if (!isValidFormat) {
							errors.push(
								'Passport number format may be invalid (please verify manually)',
							)
						}
					}
					break

				case 'National ID':
					if (!data.idNumber?.match(DocumentPatterns['National ID'].idNumber)) {
						errors.push('Invalid national ID format')
					}
					break

				case "Driver's License":
					if (
						!data.idNumber?.match(DocumentPatterns["Driver's License"].idNumber)
					) {
						errors.push("Invalid driver's license number format")
					}
					if (!data.vehicleClass) {
						errors.push('No vehicle class information found')
					}
					break
			}

			return {
				isValid: errors.length === 0,
				errors,
			}
		},
		[documentType],
	)

	return {
		validationErrors,
		setValidationErrors,
		validateDocument,
	}
}
