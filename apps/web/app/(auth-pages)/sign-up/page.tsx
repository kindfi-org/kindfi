import { Suspense } from 'react'
import { SignupComponent } from '~/components/pages/auth/sign-up'

/** OTP email dispatch can exceed Vercel's default 10s serverless limit. */
export const maxDuration = 30

export default function Signup() {
	return (
		<Suspense fallback={null}>
			<SignupComponent />
		</Suspense>
	)
}
