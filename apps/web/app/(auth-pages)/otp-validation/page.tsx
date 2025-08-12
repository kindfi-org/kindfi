import { Suspense } from 'react'
import { VerifyOTPComponent } from '~/components/pages/auth/otp-validation'

function VerifyOTPPageContent() {
	return <VerifyOTPComponent />
}

export default function VerifyOTPPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<VerifyOTPPageContent />
		</Suspense>
	)
}
