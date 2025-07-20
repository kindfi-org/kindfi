// ! TODO: CLEAN THIS UP...
import type {
	AuthenticationResponseJSON,
	GenerateAuthenticationOptionsOpts,
	GenerateRegistrationOptionsOpts,
	RegistrationResponseJSON,
	VerifyAuthenticationResponseOpts,
	VerifyRegistrationResponseOpts,
	WebAuthnCredential,
} from '@simplewebauthn/server'

import {
	generateAuthenticationOptions,
	generateRegistrationOptions,
	verifyAuthenticationResponse,
	verifyRegistrationResponse,
} from '@simplewebauthn/server'

import base64url from 'base64url'
import { ENV_PASSKEY } from './env'
import { ErrorCode, InAppError } from './errors'
import {
	deleteChallenge,
	getChallenge,
	getUser,
	saveChallenge,
	saveUser,
} from './redis'

/**
 * Retrieves the RP ID corresponding to the provided host.
 *
 * @param origin - The host for which to retrieve the RP ID.
 * @returns The matching RP ID and name.
 * @throws Error if no matching RP ID is found.
 */
const getRpInfo = (
	origin: string,
): { rpName: string; rpId: string; expectedOrigin: string } => {
	const index = ENV_PASSKEY.EXPECTED_ORIGIN.findIndex(
		(expectedOrigin: string) => origin === expectedOrigin,
	)
	if (index !== -1)
		return {
			rpName: ENV_PASSKEY.RP_NAME[index],
			rpId: ENV_PASSKEY.RP_ID[index],
			expectedOrigin: ENV_PASSKEY.EXPECTED_ORIGIN[index],
		}
	throw new InAppError(ErrorCode.NO_MATCHING_RP_ID)
}

export const getRegistrationOptions = async ({
	identifier,
	origin,
}: {
	identifier: string
	origin: string
}) => {
	const { rpId, rpName } = getRpInfo(origin)
	const userResponse = await getUser({
		rpId,
		identifier,
	})
	if (!userResponse) throw new InAppError(ErrorCode.UNEXPECTED_ERROR)
	const { credentials } = userResponse
	const opts: GenerateRegistrationOptionsOpts = {
		rpName,
		rpID: rpId,
		userName: identifier,
		timeout: ENV_PASSKEY.CHALLENGE_TTL_MS,
		attestationType: 'none',
		/**
		 * Passing in a user's list of already-registered credential IDs here prevents users from
		 * registering the same authenticator multiple times. The authenticator will simply throw an
		 * error in the browser if it's asked to perform registration when it recognizes one of the
		 * credential ID's.
		 */
		excludeCredentials: credentials.map((cred) => ({
			id: cred.id,
			type: 'public-key',
			transports: cred.transports,
		})),
		authenticatorSelection: {
			residentKey: 'discouraged',
			/**
			 * https://passkeys.dev/docs/use-cases/bootstrapping/#a-note-about-user-verification
			 */
			userVerification: 'preferred',
		},
		/**
		 * Support the most common algorithm: ES256
		 */
		supportedAlgorithmIDs: [-7],
	}
	const options = await generateRegistrationOptions(opts)
	await saveChallenge({
		identifier,
		rpId,
		challenge: options.challenge,
	})
	return options
}

export const verifyRegistration = async ({
	identifier,
	registrationResponse,
	origin,
}: {
	identifier: string
	registrationResponse: RegistrationResponseJSON
	origin: string
}) => {
	const { rpId, expectedOrigin } = getRpInfo(origin)
	const expectedChallenge = await getChallenge({
		identifier,
		rpId,
	})
	if (!expectedChallenge) throw new InAppError(ErrorCode.CHALLENGE_NOT_FOUND)

	const userResponse = await getUser({
		rpId,
		identifier,
	})
	if (!userResponse) throw new InAppError(ErrorCode.UNEXPECTED_ERROR)
	const { credentials } = userResponse

	const opts: VerifyRegistrationResponseOpts = {
		response: registrationResponse,
		expectedChallenge,
		expectedOrigin: expectedOrigin,
		expectedRPID: rpId,
		requireUserVerification: false,
	}
	const { verified, registrationInfo } = await verifyRegistrationResponse(opts)

	if (verified && registrationInfo) {
		const { credential } = registrationInfo

		const existingCredential = credentials.find(
			(cred) => cred.id === credential.id,
		)

		if (!existingCredential) {
			/**
			 * Add the returned credential to the user's list of credentials
			 */
			const newCredential: WebAuthnCredential = {
				id: credential.id,
				publicKey: credential.publicKey,
				counter: credential.counter,
				transports: registrationResponse.response.transports,
			}
			await saveUser({
				rpId,
				identifier,
				user: {
					credentials: [...credentials, newCredential],
				},
			})
		}
	}

	await deleteChallenge({ identifier, rpId })
	return { verified }
}

export const getAuthenticationOptions = async ({
	identifier,
	origin,
	challenge,
}: {
	identifier: string
	origin: string
	challenge?: string
}) => {
	const { rpId } = getRpInfo(origin)
	const userResponse = await getUser({
		rpId,
		identifier,
	})
	if (!userResponse) throw new InAppError(ErrorCode.UNEXPECTED_ERROR)

	const { credentials } = userResponse

	// If no user is found or no credentials are available, throw an error
	if (credentials.length === 0) throw new InAppError(ErrorCode.USER_NOT_FOUND)

	const opts: GenerateAuthenticationOptionsOpts = {
		timeout: ENV_PASSKEY.CHALLENGE_TTL_MS,
		allowCredentials: credentials.map((cred) => ({
			id: cred.id,
			type: 'public-key',
			transports: cred.transports,
		})),
		...(challenge && { challenge: base64url.toBuffer(challenge) }),
		userVerification: 'preferred',
		rpID: rpId,
	}

	const options = await generateAuthenticationOptions(opts)
	await saveChallenge({
		identifier,
		rpId,
		challenge: options.challenge,
	})
	return options
}

export const verifyAuthentication = async ({
	identifier,
	authenticationResponse,
	origin,
}: {
	identifier: string
	authenticationResponse: AuthenticationResponseJSON
	origin: string
}) => {
	const { rpId, expectedOrigin } = getRpInfo(origin)
	const expectedChallenge = await getChallenge({
		identifier,
		rpId,
	})
	if (!expectedChallenge) throw new InAppError(ErrorCode.CHALLENGE_NOT_FOUND)

	const userResponse = await getUser({
		rpId,
		identifier,
	})
	if (!userResponse) throw new InAppError(ErrorCode.UNEXPECTED_ERROR)
	const { credentials } = userResponse

	// Find the credential in the user's list of credentials
	const dbCredentialIndex = credentials.findIndex(
		(cred) => cred.id === authenticationResponse.id,
	)
	if (dbCredentialIndex === -1)
		throw new InAppError(ErrorCode.AUTHENTICATOR_NOT_REGISTERED)
	const dbCredential = credentials[dbCredentialIndex]

	const opts: VerifyAuthenticationResponseOpts = {
		response: authenticationResponse,
		expectedChallenge,
		expectedOrigin: expectedOrigin,
		expectedRPID: rpId,
		credential: dbCredential,
		requireUserVerification: false,
	}
	const { verified, authenticationInfo } =
		await verifyAuthenticationResponse(opts)

	if (verified) {
		// Update the credential's counter in the DB to the newest count in the authentication
		credentials[dbCredentialIndex].counter = authenticationInfo.newCounter
		await saveUser({
			rpId,
			identifier,
			user: {
				credentials,
			},
		})
	}

	await deleteChallenge({ identifier, rpId })

	return { verified }
}

// References

// https://passkeys.dev/docs/use-cases/bootstrapping/#a-note-about-user-verification
// https://simplewebauthn.dev/docs/advanced/example-project
// https://www.passkeys.com/guide#backend-setup
// https://github.com/kalepail/soroban-passkey?tab=readme-ov-file#soropass
