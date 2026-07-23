import { Suspense } from 'react'
import { LoginComponent } from '~/components/pages/auth/sign-in'

export default function Login() {
	return (
		<Suspense fallback={null}>
			<LoginComponent />
		</Suspense>
	)
}
