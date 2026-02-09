import { appEnvConfig } from '@packages/lib/config'
import {
	Account,
	Address,
	Contract,
	nativeToScVal,
	scValToNative,
	TransactionBuilder,
} from '@stellar/stellar-sdk'
import { Api } from '@stellar/stellar-sdk/rpc'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { SmartWalletTransactionService } from '~/lib/stellar/smart-wallet-transactions'

/**
 * GET /api/nfts/[address]
 *
 * Get NFTs owned by a smart wallet address
 * Note: This is a simplified implementation. For production, use an indexer.
 */
export async function GET(
	_req: NextRequest,
	{ params }: { params: Promise<{ address: string }> },
) {
	try {
		const { address } = await params

		if (!address) {
			return NextResponse.json(
				{
					error: 'Missing wallet address',
				},
				{ status: 400 },
			)
		}

		const nftContractAddress =
			process.env.NFT_CONTRACT_ADDRESS ||
			process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS

		if (!nftContractAddress) {
			return NextResponse.json(
				{
					error: 'NFT contract address not configured',
				},
				{ status: 500 },
			)
		}

		// Get configuration
		const config = appEnvConfig('web')

		// Initialize service for simulation
		const txService = new SmartWalletTransactionService(
			config.stellar.networkPassphrase,
			config.stellar.rpcUrl,
			config.stellar.fundingAccount,
		)

		// Use funding account for simulation (required for read operations)
		// Access private method via type assertion (workaround for read-only operations)
		const sourceAccount = config.stellar.fundingAccount
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			? await (txService as any).getFundingAccount()
			: new Account(address, '0')

		const nftContract = new Contract(nftContractAddress)

		// Get balance (number of NFTs owned)
		const balanceOp = nftContract.call(
			'balance',
			nativeToScVal(Address.fromString(address), { type: 'address' }),
		)

		const balanceTx = new TransactionBuilder(sourceAccount, {
			fee: '100',
			networkPassphrase: config.stellar.networkPassphrase,
		})
			.addOperation(balanceOp)
			.setTimeout(30)
			.build()

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const balanceSim = await (txService as any).server.simulateTransaction(balanceTx)

		let balance = 0
		if (!Api.isSimulationError(balanceSim) && balanceSim.result?.retval) {
			balance = Number(scValToNative(balanceSim.result.retval))
		}

		// If balance is 0, return empty array
		if (balance === 0) {
			return NextResponse.json({
				success: true,
				data: {
					nfts: [],
					total: 0,
				},
			})
		}

		// Get total supply to know max token ID
		const totalSupplyOp = nftContract.call('total_supply')
		const totalSupplyTx = new TransactionBuilder(sourceAccount, {
			fee: '100',
			networkPassphrase: config.stellar.networkPassphrase,
		})
			.addOperation(totalSupplyOp)
			.setTimeout(30)
			.build()

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const totalSupplySim = await (txService as any).server.simulateTransaction(
			totalSupplyTx,
		)

		let totalSupply = 0
		if (
			!Api.isSimulationError(totalSupplySim) &&
			totalSupplySim.result?.retval
		) {
			totalSupply = Number(scValToNative(totalSupplySim.result.retval))
		}

		// Fetch NFTs owned by this address
		// Note: This is inefficient - ideally use an indexer
		const nfts = []
		const maxTokensToCheck = Math.min(totalSupply, 100) // Limit to 100 for performance

		for (let tokenId = 0; tokenId < maxTokensToCheck; tokenId++) {
			try {
				// Check owner
				const ownerOp = nftContract.call(
					'owner_of',
					nativeToScVal(tokenId, { type: 'u32' }),
				)
				const ownerTx = new TransactionBuilder(sourceAccount, {
					fee: '100',
					networkPassphrase: config.stellar.networkPassphrase,
				})
					.addOperation(ownerOp)
					.setTimeout(30)
					.build()

				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const ownerSim = await (txService as any).server.simulateTransaction(ownerTx)

				if (!Api.isSimulationError(ownerSim) && ownerSim.result?.retval) {
					const ownerAddress = scValToNative(ownerSim.result.retval)

					// If this address owns the token, get metadata
					if (
						ownerAddress &&
						String(ownerAddress).toLowerCase() === address.toLowerCase()
					) {
						const metadataOp = nftContract.call(
							'get_metadata',
							nativeToScVal(tokenId, { type: 'u32' }),
						)
						const metadataTx = new TransactionBuilder(sourceAccount, {
							fee: '100',
							networkPassphrase: config.stellar.networkPassphrase,
						})
							.addOperation(metadataOp)
							.setTimeout(30)
							.build()

						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						const metadataSim = await (txService as any).server.simulateTransaction(
							metadataTx,
						)

						if (
							!Api.isSimulationError(metadataSim) &&
							metadataSim.result?.retval
						) {
							const metadata = scValToNative(metadataSim.result.retval) as {
								name?: string
								description?: string
								image_uri?: string
								external_url?: string
								attributes?: Array<{
									trait_type: string
									value: string
									display_type?: string
									max_value?: string
								}>
							}

							nfts.push({
								tokenId,
								owner: String(ownerAddress),
								metadata: {
									name: metadata.name || `Kinder NFT #${tokenId}`,
									description: metadata.description || '',
									image_uri: metadata.image_uri || '',
									external_url: metadata.external_url || '',
									attributes: metadata.attributes || [],
								},
							})
						}
					}
				}
			} catch (error) {
				// Token might not exist or be burned, continue
				console.debug(`Token ${tokenId} check failed:`, error)
			}
		}

		return NextResponse.json({
			success: true,
			data: {
				nfts,
				total: nfts.length,
			},
		})
	} catch (error) {
		console.error('Error fetching NFTs:', error)
		return NextResponse.json(
			{
				error: 'Failed to fetch NFTs',
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 },
		)
	}
}
