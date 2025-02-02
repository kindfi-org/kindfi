import { browserSupportsWebAuthn } from '@simplewebauthn/browser'
import { useEffect, useState } from 'react'

export const useWebAuthnSupport = () => {
	const [isWebAuthnSupported, setIsWebAuthnSupported] = useState(false)

	useEffect(() => {
		setIsWebAuthnSupported(browserSupportsWebAuthn())
	}, [])

	return isWebAuthnSupported
}
