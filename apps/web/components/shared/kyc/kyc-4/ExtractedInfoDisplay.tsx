import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '~/components/base/alert'
import type { ExtractedData } from './types'

type ExtractedInfoDisplayProps = {
	extractedData: ExtractedData | null
}

export const ExtractedInfoDisplay: React.FC<ExtractedInfoDisplayProps> = ({
	extractedData,
}) => {
	if (!extractedData) {
		return null
	}

	return (
		<Alert variant="default">
			<AlertCircle className="h-4 w-4" />
			<AlertDescription>
				<div className="mt-2">
					<p className="font-medium">Extracted Information:</p>
					<div className="mt-2 text-sm space-y-1">
						{extractedData.date && (
							<p>
								<strong>Date:</strong>{' '}
								{new Date(extractedData.date).toLocaleDateString('en-US', {
									month: 'long',
									day: 'numeric',
									year: 'numeric',
								})}
							</p>
						)}
						{extractedData.address && (
							<p>
								<strong>Address:</strong> {extractedData.address}
							</p>
						)}
					</div>
				</div>
			</AlertDescription>
		</Alert>
	)
}
