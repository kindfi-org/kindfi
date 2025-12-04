'use client'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '~/components/base/alert'
import type { DocumentType } from './types'

interface ValidationAlertsProps {
	errors: string[]
	documentType: DocumentType
}

export function ValidationAlerts({
	errors,
	documentType,
}: ValidationAlertsProps) {
	const getDocumentSpecificRequirements = () => {
		switch (documentType) {
			case 'Passport':
				return [
					'Must be a valid international passport',
					'Passport number must be clearly visible',
					'Nationality page must be shown',
					'Must show both machine readable zone (MRZ)',
				]
			case 'National ID':
				return [
					'Must be a government-issued ID card',
					'ID number must be clearly visible',
					'Both sides must be uploaded',
					'Must not be physically damaged',
				]
			case "Driver's License":
				return [
					"Must be a valid driver's license",
					'License number and class must be visible',
					'Both sides must be uploaded',
					'Must show security features',
				]
			default:
				return [
					'Document must be valid and not expired',
					'All text must be clearly visible',
					'No glare or shadows on the document',
					'Upload both front and back sides',
				]
		}
	}

	return (
		<>
			{errors.length > 0 && (
				<Alert
					variant={documentType === 'Passport' ? 'default' : 'destructive'}
					className={
						documentType === 'Passport'
							? 'bg-yellow-50 border-yellow-200 text-yellow-900'
							: ''
					}
				>
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>
						<p className="font-medium mb-2">
							{documentType === 'Passport'
								? 'Verification Warnings:'
								: 'Validation Errors:'}
						</p>
						{documentType === 'Passport' && (
							<p className="text-sm mb-2 text-yellow-800">
								Some information could not be automatically extracted. Please verify
								all information manually before proceeding.
							</p>
						)}
						<ul className="list-disc pl-4 mt-2">
							{errors.map((error) => (
								<li key={`error-${error}`}>{error}</li>
							))}
						</ul>
					</AlertDescription>
				</Alert>
			)}

			<Alert>
				<AlertCircle className="h-4 w-4" />
				<AlertDescription>
					<p className="font-medium">Requirements:</p>
					<ul className="list-disc pl-4 mt-2">
						{getDocumentSpecificRequirements().map((req) => (
							<li key={`req-${req}`}>{req}</li>
						))}
					</ul>
				</AlertDescription>
			</Alert>
		</>
	)
}
