import { appEnvConfig } from '@packages/lib/config'
import type { AppEnvInterface } from '@packages/lib/types'
import { Address, hash, StrKey, xdr } from '@stellar/stellar-sdk'

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
