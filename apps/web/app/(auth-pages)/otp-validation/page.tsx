import { Suspense } from 'react'
import { VerifyOTPComponent } from '~/components/pages/auth/otp-validation'
import { FormShell } from '~/components/shared/form/form-shell'
import { AuthLayout } from '~/components/shared/layout/auth/auth-layout'

function OtpValidationFallback() {
	return (
		<AuthLayout contentMaxWidth="lg">
			<FormShell
				className="w-full max-w-none"
				maxWidth="lg"
				title="Check Your Email"
				subtitle="Check your inbox and spam folder."
			>
				<div className="space-y-4 py-2" aria-busy="true" aria-live="polite">
					<div className="h-14 animate-pulse rounded-xl bg-slate-100" />
					<div className="mx-auto h-12 max-w-xs animate-pulse rounded-xl bg-slate-100" />
					<div className="h-11 animate-pulse rounded-xl bg-slate-100" />
				</div>
			</FormShell>
		</AuthLayout>
	)
}

export default function VerifyOTPPage() {
	return (
		<Suspense fallback={<OtpValidationFallback />}>
			<VerifyOTPComponent />
		</Suspense>
	)
}
