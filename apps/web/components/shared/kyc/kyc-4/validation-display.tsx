import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '~/components/base/alert'

interface ValidationDisplayProps {
	validationErrors: string[]
}

export const ValidationDisplay: React.FC<ValidationDisplayProps> = ({
	validationErrors = [],
}) => {
	if (validationErrors.length === 0) return null

	return (
		<Alert
			variant="default"
			className="bg-yellow-50 border-yellow-200 text-yellow-900"
		>
			<AlertCircle className="h-4 w-4" />
			<AlertDescription>
				<div className="mt-2">
					<p className="font-medium mb-2">Verification Warnings:</p>
					<p className="text-sm mb-2 text-yellow-800">
						Some information could not be automatically extracted. Please verify
						all information manually before proceeding.
					</p>
					<ul className="list-disc pl-6 mt-2 space-y-1">
						{validationErrors.map((error) => (
							<li
								key={error.replace(/\s/g, '-').toLowerCase()?.substring(0, 16)}
								className="text-yellow-800"
							>
								{error}
							</li>
						))}
					</ul>
				</div>
			</AlertDescription>
		</Alert>
	)
}
