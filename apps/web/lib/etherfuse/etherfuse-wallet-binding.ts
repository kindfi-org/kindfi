import { supabase } from '@packages/lib/supabase'
import { AppError } from '~/lib/error'

const ETHERFUSE_WALLET_BINDING_OPERATION = 'etherfuse.wallet_binding'

export type EtherfuseWalletBinding = {
	walletAddress: string
	customerId: string
	bankAccountId: string
}

const parseBindingMetadata = (metadata: unknown): EtherfuseWalletBinding | null => {
	if (!metadata || typeof metadata !== 'object') {
		return null
	}

	const record = metadata as Record<string, unknown>
	if (
		typeof record.walletAddress !== 'string' ||
		typeof record.customerId !== 'string' ||
		typeof record.bankAccountId !== 'string'
	) {
		return null
	}

	return {
		walletAddress: record.walletAddress,
		customerId: record.customerId,
		bankAccountId: record.bankAccountId,
	}
}

export const persistEtherfuseWalletBinding = async (
	userId: string,
	binding: EtherfuseWalletBinding,
): Promise<void> => {
	const { error } = await supabase.from('audit_logs').insert({
		correlation_id: crypto.randomUUID(),
		operation: ETHERFUSE_WALLET_BINDING_OPERATION,
		resource_type: 'transaction',
		actor_id: userId,
		status: 'success',
		metadata: binding,
	})

	if (error) {
		throw new AppError('Failed to persist Etherfuse wallet binding', 500)
	}
}

export const getEtherfuseWalletBinding = async (
	userId: string,
): Promise<EtherfuseWalletBinding | null> => {
	const { data, error } = await supabase
		.from('audit_logs')
		.select('metadata')
		.eq('actor_id', userId)
		.eq('operation', ETHERFUSE_WALLET_BINDING_OPERATION)
		.eq('status', 'success')
		.order('created_at', { ascending: false })
		.limit(1)
		.maybeSingle()

	if (error) {
		throw new AppError('Failed to load Etherfuse wallet binding', 500)
	}

	return parseBindingMetadata(data?.metadata)
}

export const resolveAuthorizedEtherfuseWallet = async (
	userId: string,
	requestedWalletAddress?: string | null,
): Promise<string> => {
	const binding = await getEtherfuseWalletBinding(userId)

	if (!binding) {
		throw new AppError(
			'No Etherfuse wallet is linked to your account. Start Etherfuse onboarding first.',
			403,
		)
	}

	if (requestedWalletAddress && requestedWalletAddress !== binding.walletAddress) {
		throw new AppError('Wallet address does not match your linked Etherfuse wallet.', 403)
	}

	return binding.walletAddress
}
