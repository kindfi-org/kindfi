import type {
	SmartAccountTransactionBuilder,
	TransactionChallenge,
} from '@packages/lib/smart-account'
import { SmartWalletTransactionService } from '../transactions/smart-wallet-transactions'

export class SmartWalletTransactionBuilderAdapter implements SmartAccountTransactionBuilder {
	private readonly service: SmartWalletTransactionService

	constructor(networkPassphrase?: string, rpcUrl?: string, fundingSecretKey?: string) {
		this.service = new SmartWalletTransactionService(networkPassphrase, rpcUrl, fundingSecretKey)
	}

	transferXLM(params: {
		from: string
		to: string
		amount: number
		sponsorFees?: boolean
	}): Promise<TransactionChallenge> {
		return this.service.transferXLM(params)
	}

	transferToken(params: {
		from: string
		to: string
		tokenAddress: string
		amount: number
		sponsorFees?: boolean
	}): Promise<TransactionChallenge> {
		return this.service.transferToken(params)
	}

	invokeContract(params: {
		from: string
		contractAddress: string
		functionName: string
		args: unknown[]
		sponsorFees?: boolean
	}): Promise<TransactionChallenge> {
		return this.service.invokeContract(params)
	}

	getService(): SmartWalletTransactionService {
		return this.service
	}
}

export const createSmartAccountTransactionBuilder = (
	networkPassphrase?: string,
	rpcUrl?: string,
	fundingSecretKey?: string,
): SmartAccountTransactionBuilder =>
	new SmartWalletTransactionBuilderAdapter(networkPassphrase, rpcUrl, fundingSecretKey)
