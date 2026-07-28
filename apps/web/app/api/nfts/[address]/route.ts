import { appEnvConfig } from '@packages/lib/config'
import { isValidStellarWalletAddress } from '@packages/lib/utils/wallet-address'
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
import { logger } from '@/lib/logger'
import { SmartWalletTransactionBuilderAdapter } from '@/lib/smart-account/adapters/transaction-builder.adapter'
import { addressParamSchema } from '~/lib/schemas/stellar.schemas'
import { normalizeNftMetadata, normalizeStellarAddress } from '~/lib/utils/soroban-native'
import { validateRequest } from '~/lib/utils/validation'

type NftListItem = {
	tokenId: number
	owner: string
	metadata: ReturnType<typeof normalizeNftMetadata>
}

const addressesMatch = (left: string, right: string): boolean =>
	left.toLowerCase() === right.toLowerCase()

/**
 * GET /api/nfts/[address]
 *
 * Get NFTs owned by a Stellar wallet address (G-address or Smart Account C-address).
 * Optional `tokenId` query param fetches a specific token (faster, used when DB record exists).
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ address: string }> }) {
	try {
		const { address } = await params
		const validation = validateRequest(addressParamSchema, { address })
		if (!validation.success) return validation.response
		const { address: validatedAddress } = validation.data

		if (!isValidStellarWalletAddress(validatedAddress)) {
			return NextResponse.json(
				{ error: 'Must be a valid Stellar G-address or C-address' },
				{ status: 400 },
			)
		}

		const tokenIdParam = req.nextUrl.searchParams.get('tokenId')
		const hintedTokenId =
			tokenIdParam !== null && tokenIdParam !== '' ? Number.parseInt(tokenIdParam, 10) : null
		const hasValidTokenHint =
			hintedTokenId !== null && Number.isInteger(hintedTokenId) && hintedTokenId >= 0

		const nftContractAddress =
			process.env.NFT_CONTRACT_ADDRESS || process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS

		if (!nftContractAddress) {
			return NextResponse.json(
				{
					error: 'NFT contract address not configured',
				},
				{ status: 500 },
			)
		}

		const config = appEnvConfig('web')

		const txService = new SmartWalletTransactionBuilderAdapter(
			config.stellar.networkPassphrase,
			config.stellar.rpcUrl,
			config.stellar.fundingAccount,
		)

		const sourceAccount = config.stellar.fundingAccount
			? await txService.getService().getFundingAccountForSimulation()
			: new Account(validatedAddress, '0')

		const nftContract = new Contract(nftContractAddress)
		const simulate = async (operation: ReturnType<Contract['call']>) => {
			const tx = new TransactionBuilder(sourceAccount, {
				fee: '100',
				networkPassphrase: config.stellar.networkPassphrase,
			})
				.addOperation(operation)
				.setTimeout(30)
				.build()

			return txService.getService().simulateTransaction(tx)
		}

		const fetchOwnedNft = async (tokenId: number): Promise<NftListItem | null> => {
			const ownerSim = await simulate(
				nftContract.call('owner_of', nativeToScVal(tokenId, { type: 'u32' })),
			)

			if (Api.isSimulationError(ownerSim) || !ownerSim.result?.retval) {
				return null
			}

			const ownerAddress = normalizeStellarAddress(scValToNative(ownerSim.result.retval))
			if (!ownerAddress || !addressesMatch(ownerAddress, validatedAddress)) {
				return null
			}

			const metadataSim = await simulate(
				nftContract.call('get_metadata', nativeToScVal(tokenId, { type: 'u32' })),
			)

			if (Api.isSimulationError(metadataSim) || !metadataSim.result?.retval) {
				return null
			}

			const metadata = normalizeNftMetadata(scValToNative(metadataSim.result.retval), tokenId)

			return {
				tokenId,
				owner: ownerAddress,
				metadata,
			}
		}

		if (hasValidTokenHint) {
			const hintedNft = await fetchOwnedNft(hintedTokenId as number)
			return NextResponse.json({
				success: true,
				data: {
					nfts: hintedNft ? [hintedNft] : [],
					total: hintedNft ? 1 : 0,
				},
			})
		}

		const balanceSim = await simulate(
			nftContract.call(
				'balance',
				nativeToScVal(Address.fromString(validatedAddress), { type: 'address' }),
			),
		)

		let balance = 0
		if (!Api.isSimulationError(balanceSim) && balanceSim.result?.retval) {
			balance = Number(scValToNative(balanceSim.result.retval))
		}

		if (balance === 0) {
			return NextResponse.json({
				success: true,
				data: {
					nfts: [],
					total: 0,
				},
			})
		}

		const totalSupplySim = await simulate(nftContract.call('total_supply'))

		let totalSupply = 0
		if (!Api.isSimulationError(totalSupplySim) && totalSupplySim.result?.retval) {
			totalSupply = Number(scValToNative(totalSupplySim.result.retval))
		}

		const nfts: NftListItem[] = []
		const maxTokensToCheck = Math.min(totalSupply, 100)

		for (let tokenId = 0; tokenId < maxTokensToCheck; tokenId++) {
			try {
				const nft = await fetchOwnedNft(tokenId)
				if (nft) {
					nfts.push(nft)
				}
			} catch (_error) {}
		}

		return NextResponse.json({
			success: true,
			data: {
				nfts,
				total: nfts.length,
			},
		})
	} catch (error) {
		logger.error('Error fetching NFTs:', error)
		return NextResponse.json(
			{
				error: 'Failed to fetch NFTs',
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 },
		)
	}
}
