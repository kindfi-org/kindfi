import { appEnvConfig } from '@packages/lib/config'
import type { AppEnvInterface } from '@packages/lib/types'
import { Address, hash, Keypair, StrKey, xdr } from '@stellar/stellar-sdk'

/**
 * Generates a Stellar contract address from a contract salt
 * This is used to pre-calculate the address that will be deployed
 */
export function generateStellarAddress(contractSalt: Buffer): string {
	// Validate salt length
	if (contractSalt.length !== 32) {
		throw new Error(
			`Contract salt must be exactly 32 bytes, got ${contractSalt.length}`,
		)
	}

	const config: AppEnvInterface = appEnvConfig('web')
	const deployee = StrKey.encodeContract(
		hash(
			xdr.HashIdPreimage.envelopeTypeContractId(
				new xdr.HashIdPreimageContractId({
					networkId: hash(
						Buffer.from(config.stellar.networkPassphrase, 'utf-8'),
					),
					contractIdPreimage:
						xdr.ContractIdPreimage.contractIdPreimageFromAddress(
							new xdr.ContractIdPreimageFromAddress({
								address: Address.fromString(
									config.stellar.factoryContractId,
								).toScAddress(),
								salt: contractSalt,
							}),
						),
				}),
			).toXDR(),
		),
	)
	return deployee
}

/**
 * Handles the deployment of a Stellar account using passkey data
 * This should only be called during the approval phase, not registration
 */
export async function handleDeploy(params: {
	credentialId: string
	publicKey: string
	contractSalt: Buffer
	accountId: Buffer
}): Promise<{ address: string; transactionHash?: string }> {
	const { credentialId, contractSalt } = params

	try {
		console.log('🚀 Starting Stellar account deployment for:', credentialId)

		// Pre-calculate the contract address
		const contractAddress = generateStellarAddress(contractSalt)

		// TODO: Implement actual deployment logic using Passkey Kit
		// This should use the official Passkey Kit library instead of our custom implementation
		// For now, return the pre-calculated address
		console.log('✅ Generated contract address:', contractAddress)

		return {
			address: contractAddress,
			transactionHash: undefined, // Will be set when actual deployment is implemented
		}
	} catch (error) {
		console.error('❌ Error during deployment:', error)
		throw new Error(`Deployment failed: ${error}`)
	}
}

/**
 * Creates a funding keypair for testing
 * In production, this should use a properly funded account
 */
export function createFundingKeypair(): Keypair {
	// For development only - in production, load from secure storage
	return Keypair.random()
}
