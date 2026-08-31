'use client'

import type { Database } from '@services/supabase'
import { createContext, useContext, useMemo } from 'react'
import { useWallet } from '~/hooks/contexts/use-stellar-wallet.context'
import { useEffectiveWalletAddress } from '~/hooks/wallet/use-effective-wallet-address'

type Role = Database['public']['Enums']['user_role']

export interface DashboardUser {
	id: string
	email: string
	created_at: string
	profile: {
		role: Role | null
		display_name: string | null
		bio: string | null
		image_url: string | null
		slug?: string | null
		onboarding_provider?: 'legacy_passkey' | 'pollar' | null
		pollar_wallet_address?: string | null
		external_wallet_address?: string | null
		product_tour_completed_at?: string | null
	} | null
}

export interface DashboardContextValue {
	user: DashboardUser
	role: Role | null
	displayName: string
	smartAccountAddress: string | null
	/** Resolved best-available G-address (Pollar > external > kit) */
	effectiveWalletAddress: string | null
	isWalletReady: boolean
	isPollarUser: boolean
	/** External Stellar Wallet Kit address */
	externalWalletAddress: string | null
	isExternalConnected: boolean
	connectKit: () => Promise<void>
	disconnectKit: () => void
	kycCompleted: boolean
}

const DashboardContext = createContext<DashboardContextValue | null>(null)

interface DashboardProviderProps {
	user: DashboardUser
	smartAccountAddress?: string | null
	kycCompleted?: boolean
	children: React.ReactNode
}

export function DashboardProvider({
	user,
	smartAccountAddress = null,
	kycCompleted = false,
	children,
}: DashboardProviderProps) {
	const { address: externalWalletAddress, connect, disconnect, isConnected } = useWallet()
	const {
		address: effectiveWalletAddress,
		isReady: isWalletReady,
		isPollarUser,
		connectKit,
	} = useEffectiveWalletAddress({
		profilePollarAddress: user.profile?.pollar_wallet_address,
		profileExternalAddress: user.profile?.external_wallet_address,
	})

	const displayName = useMemo(
		() => user.profile?.display_name || user.email?.split('@')[0] || 'You',
		[user.profile?.display_name, user.email],
	)

	const value = useMemo<DashboardContextValue>(
		() => ({
			user,
			role: user.profile?.role ?? null,
			displayName,
			smartAccountAddress,
			effectiveWalletAddress,
			isWalletReady,
			isPollarUser,
			externalWalletAddress,
			isExternalConnected: isConnected,
			connectKit,
			disconnectKit: disconnect,
			kycCompleted,
		}),
		[
			user,
			displayName,
			smartAccountAddress,
			effectiveWalletAddress,
			isWalletReady,
			isPollarUser,
			externalWalletAddress,
			isConnected,
			connectKit,
			disconnect,
			kycCompleted,
		],
	)

	return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>
}

export function useDashboardContext(): DashboardContextValue {
	const ctx = useContext(DashboardContext)
	if (!ctx) throw new Error('useDashboardContext must be used inside DashboardProvider')
	return ctx
}
