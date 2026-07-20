import { appEnvConfig } from '@packages/lib/config'
import {
	buildWebAuthnSignatureScVal,
	computeDeviceIdFromCoseKey,
	type verifyAuthentication,
	type WebAuthnAssertionResponse,
} from '@packages/lib/passkey'
import type {
	SmartAccountTransactionSubmitter,
	SubmitTransactionResult,
	WebAuthnSubmitParams,
} from '@packages/lib/smart-account'
import { Keypair, type Transaction, TransactionBuilder, xdr } from '@stellar/stellar-sdk'
import { type Api, Server } from '@stellar/stellar-sdk/rpc'
import isEqual from 'lodash/isEqual'
import { logger } from '@/lib/logger'

export const submitSmartAccountTransferWithWebAuthn = async (
	params: WebAuthnSubmitParams,
): Promise<SubmitTransactionResult> => {
	const appConfig = appEnvConfig('web')
	const { transactionXDR, authResponse, verificationJSON } = params

	const server = new Server(appConfig.stellar.rpcUrl)

	if (!appConfig.stellar.fundingAccount) {
		throw new Error('Funding account not configured')
	}

	const fundingKeypair = Keypair.fromSecret(appConfig.stellar.fundingAccount)

	let transaction: Transaction
	try {
		transaction = TransactionBuilder.fromXDR(
			transactionXDR,
			appConfig.stellar.networkPassphrase,
		) as Transaction
	} catch (error) {
		logger.error('Invalid transactionXDR:', error)
		throw new Error('Invalid transactionXDR format')
	}

	const verification = verificationJSON as Awaited<ReturnType<typeof verifyAuthentication>>

	const authEntries =
		(transaction.operations[0] as unknown as Api.SimulateHostFunctionResult).auth || []

	if (authEntries.length) {
		const publicKeyArray =
			verification.device.pubKey instanceof Uint8Array
				? verification.device.pubKey
				: new Uint8Array(Object.values(verification.device.pubKey as Record<string, number>))
		const publicKey = Buffer.from(publicKeyArray).toString('base64')
		const credentialId = verification.device.id
		const deviceIdHex = computeDeviceIdFromCoseKey(publicKey)
		const signatureResult = buildWebAuthnSignatureScVal({
			assertion: authResponse as WebAuthnAssertionResponse,
			userData: {
				credential_id: String(credentialId ?? ''),
				public_key: publicKey,
				device_id_hex: deviceIdHex,
			},
		})
		const { signatureScVal: signatureScValRaw } = signatureResult
		const signatureScVal = xdr.ScVal.fromXDR(signatureScValRaw.toXDR())

		for (const authEntry of authEntries) {
			const isSameCredentialMapping = isEqual(
				{ ...authEntry.credentials().switch() },
				{ ...xdr.SorobanCredentialsType.sorobanCredentialsAddress() },
			)
			if (isSameCredentialMapping) {
				const addressCredentials = authEntry.credentials().address()
				const newCredentials = new xdr.SorobanAddressCredentials({
					address: addressCredentials.address(),
					nonce: addressCredentials.nonce(),
					signatureExpirationLedger: addressCredentials.signatureExpirationLedger(),
					signature: signatureScVal,
				})
				authEntry.credentials(xdr.SorobanCredentials.sorobanCredentialsAddress(newCredentials))
				break
			}
		}
	}

	transaction.sign(fundingKeypair)

	const submitResult = await server.sendTransaction(transaction)

	if (submitResult.status === 'ERROR' || submitResult?.errorResult) {
		logger.error('Submit error:', submitResult)
		throw new Error(
			`Transaction submission failed: ${JSON.stringify(submitResult.errorResult, null, 2) || 'Unknown error'}`,
		)
	}

	return {
		hash: submitResult.hash,
		status: 'pending',
	}
}

export class SmartAccountTransactionSubmitterAdapter implements SmartAccountTransactionSubmitter {
	submitWithWebAuthn(params: WebAuthnSubmitParams): Promise<SubmitTransactionResult> {
		return submitSmartAccountTransferWithWebAuthn(params)
	}
}

export const createSmartAccountTransactionSubmitter = (): SmartAccountTransactionSubmitter =>
	new SmartAccountTransactionSubmitterAdapter()
