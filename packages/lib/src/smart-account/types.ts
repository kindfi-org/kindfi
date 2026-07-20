export interface PasskeyAccountCreationParams {
	credentialId: string
	publicKey: string
	userId?: string
}

export interface PasskeyAccountResult {
	address: string
	transactionHash?: string
	isExisting?: boolean
	salt?: string
	deviceId?: string
}

export interface PasskeyAccountInfo {
	address: string
	balance: string
	sequence: string
	status: 'active' | 'not_found' | 'inactive'
}

export interface TransactionChallenge {
	challenge: string
	transactionXDR: string
	hash: string
}

export interface WebAuthnSubmitParams {
	transactionXDR: string
	hash?: string
	authResponse: unknown
	userDevice: { address: string }
	verificationJSON: unknown
}

export interface SubmitTransactionResult {
	hash: string
	status: string
}

/**
 * Deploys a C-address smart wallet on passkey registration.
 */
export interface SmartAccountDeployer {
	deployPasskeyAccount(
		params: PasskeyAccountCreationParams & { salt?: string; deviceId?: string },
	): Promise<PasskeyAccountResult>
	getAccountInfo(contractAddress: string): Promise<PasskeyAccountInfo>
}

/**
 * Builds Soroban transactions and WebAuthn challenges for C-address wallets.
 */
export interface SmartAccountTransactionBuilder {
	transferXLM(params: {
		from: string
		to: string
		amount: number
		sponsorFees?: boolean
	}): Promise<TransactionChallenge>
	transferToken(params: {
		from: string
		to: string
		tokenAddress: string
		amount: number
		sponsorFees?: boolean
	}): Promise<TransactionChallenge>
	invokeContract(params: {
		from: string
		contractAddress: string
		functionName: string
		args: unknown[]
		sponsorFees?: boolean
	}): Promise<TransactionChallenge>
}

/**
 * Patches WebAuthn auth entries and submits signed C-address transactions.
 */
export interface SmartAccountTransactionSubmitter {
	submitWithWebAuthn(params: WebAuthnSubmitParams): Promise<SubmitTransactionResult>
}

/**
 * Client SDK lifecycle for OpenZeppelin Smart Account Kit (future primary path).
 */
export interface SmartAccountKitClient {
	createWallet(
		appName: string,
		userName: string,
		options?: { autoSubmit?: boolean; autoFund?: boolean },
	): Promise<{ contractId: string; credentialId: string }>
	connectWallet(options?: {
		prompt?: boolean
		fresh?: boolean
		credentialId?: string
		contractId?: string
	}): Promise<{ contractId: string; credentialId: string } | null>
	disconnect(): Promise<void>
	signAndSubmit(transaction: unknown, options?: { skipRelayer?: boolean }): Promise<unknown>
	transfer(
		tokenContract: string,
		recipient: string,
		amount: string,
		options?: { skipRelayer?: boolean },
	): Promise<unknown>
}

/**
 * Resolves a C-address from session or device storage.
 */
export interface SmartAccountAddressResolver {
	resolve(address: string | null | undefined): string | null
}
