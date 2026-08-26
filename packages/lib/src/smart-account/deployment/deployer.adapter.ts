import type {
	PasskeyAccountCreationParams,
	PasskeyAccountInfo,
	PasskeyAccountResult,
	SmartAccountDeployer,
} from '../types'
import { StellarPasskeyService } from './stellar-passkey-deploy.service'

export class StellarPasskeyDeployerAdapter implements SmartAccountDeployer {
	private readonly service: StellarPasskeyService

	constructor(networkPassphrase?: string, rpcUrl?: string, fundingSecretKey?: string) {
		this.service = new StellarPasskeyService(networkPassphrase, rpcUrl, fundingSecretKey)
	}

	deployPasskeyAccount(
		params: PasskeyAccountCreationParams & { salt?: string; deviceId?: string },
	): Promise<PasskeyAccountResult> {
		return this.service.deployPasskeyAccount(params)
	}

	getAccountInfo(contractAddress: string): Promise<PasskeyAccountInfo> {
		return this.service.getAccountInfo(contractAddress)
	}
}

export const createSmartAccountDeployer = (
	networkPassphrase?: string,
	rpcUrl?: string,
	fundingSecretKey?: string,
): SmartAccountDeployer =>
	new StellarPasskeyDeployerAdapter(networkPassphrase, rpcUrl, fundingSecretKey)
