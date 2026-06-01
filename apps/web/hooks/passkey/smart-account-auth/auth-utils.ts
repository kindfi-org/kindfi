import { signIn } from 'next-auth/react'
import { createSessionAction } from '~/app/actions/auth'
import { ErrorCode, InAppError } from '~/lib/passkey/errors'

export const formatAuthError = (
	error: Error,
	setIsNotRegistered: (value: boolean) => void,
): string => {
	if (
		error.message.includes(
			'The operation either timed out or was not allowed.',
		)
	) {
		return 'Operation cancelled or not allowed'
	}

	if (error.message.includes('User not found')) {
		setIsNotRegistered(true)
		return 'User not registered. Please register first.'
	}

	return `Authentication failed: ${error.message}`
}

export type AuthVerificationResult = {
	verified: boolean
	smartAccountAddress?: string
	credentialId?: string
}

export type VerificationResponse = {
	verified: boolean
	userId?: string
	publicKey?: string
	credentialId?: string
	smartAccountAddress?: string
	error?: string
}

export const fetchAuthOptions = async (
	identifier: string,
): Promise<unknown> => {
	const authOptionsResponse = await fetch('/api/passkey/generate-auth-options', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			identifier,
			origin: window.location.origin,
		}),
	})

	if (!authOptionsResponse.ok) {
		const errorData = await authOptionsResponse.json()
		throw new InAppError(ErrorCode.UNEXPECTED_ERROR, errorData.error)
	}

	return authOptionsResponse.json()
}

export const verifyAuthentication = async (
	identifier: string,
	authenticationResponse: unknown,
	userId?: string,
): Promise<VerificationResponse> => {
	const verificationResp = await fetch('/api/passkey/verify-auth', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			identifier,
			authenticationResponse,
			origin: window.location.origin,
			userId,
		}),
	})

	if (!verificationResp.ok) {
		const verificationJSON = await verificationResp.json()
		throw new InAppError(ErrorCode.UNEXPECTED_ERROR, verificationJSON.error)
	}

	return verificationResp.json()
}

export const createAuthSession = async (
	verificationJSON: VerificationResponse,
	identifier: string,
): Promise<void> => {
	if (!verificationJSON.userId) return

	const sessionResult = await createSessionAction({
		userId: verificationJSON.userId,
		email: identifier,
	})

	if (!sessionResult.success) {
		throw new InAppError(ErrorCode.UNEXPECTED_ERROR, sessionResult.message)
	}

	const pubKeyString = verificationJSON.publicKey || ''

	const loginResult = await signIn('credentials', {
		redirect: false,
		userId: verificationJSON.userId,
		email: identifier,
		pubKey: pubKeyString,
		credentialId: verificationJSON.credentialId,
		address: verificationJSON.smartAccountAddress,
	})

	if (!loginResult?.ok) {
		throw new InAppError(
			ErrorCode.UNEXPECTED_ERROR,
			'Failed to create authentication session',
		)
	}
}
