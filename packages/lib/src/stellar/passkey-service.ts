// TODO: Relocating to packages instead of kyc-server for apps usage...
import { appEnvConfig } from '@packages/lib/config'
import type { AppEnvInterface } from '@packages/lib/types'
import type {
	AuthenticationResponseJSON,
	WebAuthnCredential as BaseWebAuthnCredential,
	GenerateAuthenticationOptionsOpts,
	GenerateRegistrationOptionsOpts,
	RegistrationResponseJSON,
	VerifyAuthenticationResponseOpts,
	VerifyRegistrationResponseOpts,
} from '@simplewebauthn/server'
import {
	generateAuthenticationOptions,
	generateRegistrationOptions,
	verifyAuthenticationResponse,
	verifyRegistrationResponse,
} from '@simplewebauthn/server'
import base64url from 'base64url'
import { ErrorCode, InAppError } from '~/lib/passkey/errors'
import { StellarPasskeyService } from '../stellar/stellar-passkey-service'
import {
	deleteChallenge,
	getChallenge,
	getUser,
	saveChallenge,
	saveUser,
} from './database'

// Extended WebAuthnCredential with Stellar address support
export interface WebAuthnCredential extends BaseWebAuthnCredential {
	address?: string // Smart wallet contract address (C... format)
	aaguid?: string
}

const appConfig: AppEnvInterface = appEnvConfig('kyc-server')

// Initialize Stellar passkey service for smart wallet deployment
const stellarService = new StellarPasskeyService(
	appConfig.stellar.networkPassphrase,
	appConfig.stellar.rpcUrl,
	appConfig.stellar.fundingAccount,
)

/**
 * Retrieves the RP ID corresponding to the provided host.
 */
const getRpInfo = (
	origin: string,
): { rpName: string; rpId: string; expectedOrigin: string } => {
	const expectedOrigins = appConfig.passkey.expectedOrigin
	const rpIds = appConfig.passkey.rpId
	const rpNames = appConfig.passkey.rpName

	const index = expectedOrigins.findIndex(
		(expectedOrigin: string) => origin === expectedOrigin,
	)

	if (index === -1) {
		throw new Error(`Origin ${origin} not found in expected origins`)
	}

	return {
		rpName: rpNames[index] || rpNames[0],
		rpId: rpIds[index] || rpIds[0],
		expectedOrigin: expectedOrigins[index],
	}
}

export const getRegistrationOptions = async ({
	identifier,
	origin,
	userId,
}: {
	identifier: string
	origin: string
	userId?: string
}) => {
	const { rpId, rpName } = getRpInfo(origin)
	const userResponse = await getUser({
		rpId,
		identifier,
		userId,
	})
	if (!userResponse) throw new InAppError(ErrorCode.UNEXPECTED_ERROR)
	const { credentials } = userResponse

	const opts: GenerateRegistrationOptionsOpts = {
		rpName,
		rpID: rpId,
		userName: identifier,
		timeout: appConfig.passkey.challengeTtlMs,
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
		userId,
	})

	return options
}

export const verifyRegistration = async ({
	identifier,
	registrationResponse,
	origin,
	userId,
}: {
	identifier: string
	registrationResponse: RegistrationResponseJSON
	origin: string
	userId?: string
}) => {
	const { rpId, expectedOrigin } = getRpInfo(origin)
	const expectedChallenge = await getChallenge({
		identifier,
		rpId,
		userId,
	})
	if (!expectedChallenge) throw new InAppError(ErrorCode.CHALLENGE_NOT_FOUND)

	const userResponse = await getUser({
		rpId,
		identifier,
		userId,
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

	let contractAddress: string | undefined

	if (verified && registrationInfo) {
		const { credential } = registrationInfo

		const existingCredential = credentials.find(
			(cred) => cred.id === credential.id,
		)

		if (!existingCredential) {
			/**
			 * Deploy smart wallet contract on-chain during registration
			 * This creates the user's Stellar account as a smart contract
			 */
			try {
				console.log('🚀 Deploying smart wallet for new passkey:', credential.id)

				// Extract public key from attestation response
				const publicKeyBase64 = credential.publicKey.toBase64()

				// Deploy smart wallet via account-factory
				const deploymentResult = await stellarService.deployPasskeyAccount({
					credentialId: credential.id,
					publicKey: publicKeyBase64,
					userId,
				})

				contractAddress = deploymentResult.address

				console.log('✅ Smart wallet deployed:', contractAddress)
			} catch (error) {
				console.error('❌ Failed to deploy smart wallet:', error)
				throw new InAppError(
					ErrorCode.UNEXPECTED_ERROR,
					`Smart wallet deployment failed: ${error}`,
				)
			}

			/**
			 * Add the returned credential to the user's list of credentials
			 * Store the smart wallet contract address with the credential
			 */
			const newCredential: WebAuthnCredential = {
				id: credential.id,
				address: contractAddress, // Store contract address (C... format)
				publicKey: credential.publicKey,
				aaguid: (credential as BaseWebAuthnCredential & { aaguid?: string })
					.aaguid,
				counter: credential.counter,
				transports: registrationResponse.response.transports,
			}
			await saveUser({
				rpId,
				identifier,
				user: {
					credentials: [...credentials, newCredential],
				},
				userId,
			})
		}
	}

	await deleteChallenge({ identifier, rpId, userId })
	return { verified, address: contractAddress }
}

export const getAuthenticationOptions = async ({
	identifier,
	origin,
	challenge,
	userId,
}: {
	identifier: string
	origin: string
	challenge?: string
	userId?: string
}) => {
	const { rpId } = getRpInfo(origin)
	const userResponse = await getUser({
		rpId,
		identifier,
		userId,
	})
	if (!userResponse) throw new InAppError(ErrorCode.UNEXPECTED_ERROR)

	const { credentials } = userResponse

	// If no user is found or no credentials are available, throw an error
	if (credentials.length === 0) throw new InAppError(ErrorCode.USER_NOT_FOUND)

	const opts: GenerateAuthenticationOptionsOpts = {
		userVerification: 'preferred',
		rpID: rpId,
		// TODO: Check this, we should always have a mapped challenge that both Stellar and Devices supports
		challenge: challenge
			? new Uint8Array(base64url.toBuffer(challenge))
			: undefined,
		timeout: appConfig.passkey.challengeTtlMs,
		allowCredentials: credentials.map((cred) => ({
			id: cred.id,
			type: 'public-key' as const,
			transports: cred.transports,
		})),
	}

	const options = await generateAuthenticationOptions(opts)
	await saveChallenge({
		identifier,
		rpId,
		challenge: options.challenge,
		userId,
	})

	return options
}

export const verifyAuthentication = async ({
	identifier,
	authenticationResponse,
	origin,
	userId,
}: {
	identifier: string
	authenticationResponse: AuthenticationResponseJSON
	origin: string
	userId?: string
}) => {
	const { rpId, expectedOrigin } = getRpInfo(origin)
	const expectedChallenge = await getChallenge({
		identifier,
		rpId,
		userId,
	})
	if (!expectedChallenge) throw new InAppError(ErrorCode.CHALLENGE_NOT_FOUND)

	const userResponse = await getUser({
		rpId,
		identifier,
		userId,
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
			userId,
		})
	}

	await deleteChallenge({ identifier, rpId, userId })

	const device = {
		id: dbCredential.id,
		pubKey: dbCredential.publicKey,
		address: dbCredential.address || '',
		transports: dbCredential.transports,
	}

	return { verified, device }
}
