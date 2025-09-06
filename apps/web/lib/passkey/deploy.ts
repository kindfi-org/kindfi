import { appEnvConfig } from '@packages/lib/config'
import type { AppEnvInterface } from '@packages/lib/types'
import {
	Account,
	Address,
	hash,
	type Keypair,
	Operation,
	StrKey,
	TransactionBuilder,
	xdr,
} from '@stellar/stellar-sdk'
import { Api, assembleTransaction, Server } from '@stellar/stellar-sdk/rpc'

export async function handleDeploy(
	bundlerKey: Keypair,
	contractSalt: Buffer,
	publicKey?: Buffer,
): Promise<string> {
	const config: AppEnvInterface = appEnvConfig('web')
	const rpc = new Server(config.stellar.rpcUrl)
	const deployee = generateStellarAddress(contractSalt)

	// This is a signup deploy vs a signin deploy. Look up if this contract has been already been deployed, otherwise fail
	if (!publicKey) {
		await rpc.getContractData(
			deployee,
			xdr.ScVal.scvLedgerKeyContractInstance(),
		)
		return deployee
	}

	const bundlerKeyAccount = await rpc
		.getAccount(bundlerKey.publicKey())
		.then((res) => new Account(res.accountId(), res.sequenceNumber()))
	const simTxn = new TransactionBuilder(bundlerKeyAccount, {
		fee: '100',
		networkPassphrase: config.stellar.networkPassphrase,
	})
		.addOperation(
			Operation.invokeContractFunction({
				contract: config.stellar.factoryContractId,
				function: 'deploy',
				args: [xdr.ScVal.scvBytes(contractSalt), xdr.ScVal.scvBytes(publicKey)],
			}),
		)
		.setTimeout(0)
		.build()

	const sim = await rpc.simulateTransaction(simTxn)

	if (Api.isSimulationError(sim) || Api.isSimulationRestore(sim)) throw sim

	const transaction = assembleTransaction(simTxn, sim).setTimeout(0).build()

	transaction.sign(bundlerKey)

	// TODO failure here is resulting in sp:deployee undefined
	// TODO handle archived entries

	const txResp = await (
		await fetch(`${config.stellar.horizonUrl}/transactions`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams({ tx: transaction.toXDR() }),
		})
	).json()

	if (txResp.successful) return deployee

	throw txResp
}

export function generateStellarAddress(contractSalt: Buffer): string {
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
