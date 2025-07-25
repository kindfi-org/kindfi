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
		<Alert variant="destructive">
			<AlertCircle className="h-4 w-4" />
			<AlertDescription>
				<div className="mt-2">
					<p className="font-medium">Validation Errors:</p>
					<ul className="list-disc pl-6 mt-2 space-y-1">
						{validationErrors.map((error) => (
							<li
								key={error.replace(/\s/g, '-').toLowerCase()?.substring(0, 16)}
								className="text-destructive"
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
