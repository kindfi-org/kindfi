import type { SmartAccountKitClient } from '@packages/lib/smart-account'
import { type CreateWalletOptions, SmartAccountKitService } from '../kit/smart-account-kit.service'

export class SmartAccountKitClientAdapter implements SmartAccountKitClient {
	private readonly service: SmartAccountKitService

	constructor() {
		this.service = new SmartAccountKitService()
	}

	createWallet(
		appName: string,
		userName: string,
		options?: CreateWalletOptions,
	): Promise<{ contractId: string; credentialId: string }> {
		return this.service.createWallet(appName, userName, options)
	}

	connectWallet(options?: {
		prompt?: boolean
		fresh?: boolean
		credentialId?: string
		contractId?: string
	}): Promise<{ contractId: string; credentialId: string } | null> {
		return this.service.connectWallet(options)
	}

	disconnect(): Promise<void> {
		return this.service.disconnect()
	}

	signAndSubmit(transaction: unknown, options?: { skipRelayer?: boolean }): Promise<unknown> {
		return this.service.signAndSubmit(transaction, options)
	}

	transfer(
		tokenContract: string,
		recipient: string,
		amount: string,
		options?: { skipRelayer?: boolean },
	): Promise<unknown> {
		return this.service.transfer(tokenContract, recipient, amount, options)
	}
}

export const createSmartAccountKitClient = (): SmartAccountKitClient =>
	new SmartAccountKitClientAdapter()
