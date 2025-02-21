import {
	Account,
	Address,
	type Keypair,
	Operation,
	rpc as SorobanRpc,
	StrKey,
	TransactionBuilder,
	hash,
	xdr,
} from '@stellar/stellar-sdk'
import { ENV } from '~/lib/passkey/env'

const { RPC_URL, FACTORY_CONTRACT_ID, HORIZON_URL, NETWORK_PASSPHRASE } = ENV

export async function handleDeploy(
	bundlerKey: Keypair,
	contractSalt: Buffer,
	publicKey?: Buffer
) {
	const rpc = new SorobanRpc.Server(RPC_URL)
	const deployee = StrKey.encodeContract(
		hash(
			xdr.HashIdPreimage.envelopeTypeContractId(
				new xdr.HashIdPreimageContractId({
					networkId: hash(Buffer.from(NETWORK_PASSPHRASE, 'utf-8')),
					contractIdPreimage:
						xdr.ContractIdPreimage.contractIdPreimageFromAddress(
							new xdr.ContractIdPreimageFromAddress({
								address: Address.fromString(FACTORY_CONTRACT_ID).toScAddress(),
								salt: contractSalt,
							})
						),
				})
			).toXDR()
		)
	)

	// This is a signup deploy vs a signin deploy. Look up if this contract has been already been deployed, otherwise fail
	if (!publicKey) {
		await rpc.getContractData(
			deployee,
			xdr.ScVal.scvLedgerKeyContractInstance()
		)
		return deployee
	}

	const bundlerKeyAccount = await rpc
		.getAccount(bundlerKey.publicKey())
		.then((res) => new Account(res.accountId(), res.sequenceNumber()))
	const simTxn = new TransactionBuilder(bundlerKeyAccount, {
		fee: '100',
		networkPassphrase: NETWORK_PASSPHRASE,
	})
		.addOperation(
			Operation.invokeContractFunction({
				contract: FACTORY_CONTRACT_ID,
				function: 'deploy',
				args: [xdr.ScVal.scvBytes(contractSalt), xdr.ScVal.scvBytes(publicKey)],
			})
		)
		.setTimeout(0)
		.build()

	const sim = await rpc.simulateTransaction(simTxn)

	if (
		SorobanRpc.Api.isSimulationError(sim) ||
		SorobanRpc.Api.isSimulationRestore(sim)
	)
		throw sim

	const transaction = SorobanRpc.assembleTransaction(simTxn, sim)
		.setTimeout(0)
		.build()

	transaction.sign(bundlerKey)

	// TODO failure here is resulting in sp:deployee undefined
	// TODO handle archived entries

	const txResp = await (
		await fetch(`${HORIZON_URL}/transactions`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams({ tx: transaction.toXDR() }),
		})
	).json()

	if (txResp.successful) return deployee

	throw txResp
}
