'use client'

import { isPollarOnboardingEnabled } from '@packages/lib/pollar'
import { isSmartAccountEnabled } from '@packages/lib/smart-account'
import { usePollar } from '@pollar/react'
import { CheckCircle2, Copy, Link2, LogOut, Wallet } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '~/components/base/badge'
import { Button } from '~/components/base/button'
import { useI18n } from '~/lib/i18n'
import { usePollarProviderReady } from '~/lib/pollar/provider'
import { ProfileSurfaceCard } from '../profile-surface-card'

interface WalletCardProps {
	smartAccountAddress: string | null
	externalWalletAddress: string | null
	isExternalConnected: boolean
	onboardingProvider?: 'legacy_passkey' | 'pollar' | null
	pollarWalletAddress?: string | null
	onConnectExternal: () => Promise<void>
	onDisconnectExternal?: () => void
}

const truncateAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-6)}`

export function WalletCard(props: WalletCardProps) {
	if (props.onboardingProvider === 'pollar' && isPollarOnboardingEnabled()) {
		return <PollarWalletCard {...props} />
	}
	return <LegacyWalletCard {...props} />
}

function PollarWalletCard({ pollarWalletAddress, externalWalletAddress }: WalletCardProps) {
	const pollarReady = usePollarProviderReady()
	const pollarAddress = pollarWalletAddress ?? externalWalletAddress

	if (!pollarReady) {
		if (!pollarAddress) {
			return null
		}

		return (
			<ProfileSurfaceCard className="h-full">
				<WalletCardHeader isPollar />
				<div className="mt-5">
					<AddressRow address={pollarAddress} isCopied={false} onCopy={() => {}} />
				</div>
			</ProfileSurfaceCard>
		)
	}

	return (
		<PollarWalletCardConnected
			pollarWalletAddress={pollarWalletAddress}
			externalWalletAddress={externalWalletAddress}
		/>
	)
}

function PollarWalletCardConnected({
	pollarWalletAddress,
	externalWalletAddress,
}: Pick<WalletCardProps, 'pollarWalletAddress' | 'externalWalletAddress'>) {
	const { t } = useI18n()
	const { walletBalance, refreshWalletBalance, openWalletBalanceModal } = usePollar()
	const [copiedPollar, setCopiedPollar] = useState(false)

	const pollarAddress = pollarWalletAddress ?? externalWalletAddress

	useEffect(() => {
		void refreshWalletBalance()
	}, [refreshWalletBalance])

	const handleCopy = async (address: string) => {
		try {
			await navigator.clipboard.writeText(address)
			setCopiedPollar(true)
			setTimeout(() => setCopiedPollar(false), 2000)
			toast.success(t('profile.addressCopied'))
		} catch {
			toast.error(t('profile.addressCopyFailed'))
		}
	}

	const usdcBalance =
		walletBalance.step === 'loaded'
			? walletBalance.data.balances.find((b) => b.code === 'USDC')?.balance
			: null

	if (!pollarAddress) {
		return null
	}

	return (
		<ProfileSurfaceCard className="h-full">
			<WalletCardHeader isPollar />
			<div className="mt-5 space-y-3">
				<AddressRow
					address={pollarAddress}
					isCopied={copiedPollar}
					onCopy={() => handleCopy(pollarAddress)}
				/>
				{usdcBalance ? (
					<p className="text-sm text-muted-foreground">
						{t('auth.pollarWalletBalance')}: {usdcBalance} USDC
					</p>
				) : null}
				<Button
					variant="outline"
					size="sm"
					className="w-full rounded-full"
					onClick={() => openWalletBalanceModal()}
				>
					{t('auth.pollarWalletBalance')}
				</Button>
			</div>
		</ProfileSurfaceCard>
	)
}

function LegacyWalletCard({
	smartAccountAddress,
	externalWalletAddress,
	isExternalConnected,
	onConnectExternal,
	onDisconnectExternal,
}: WalletCardProps) {
	const { t } = useI18n()
	const [isMounted, setIsMounted] = useState(false)
	const [copiedSmartAccount, setCopiedSmartAccount] = useState(false)
	const [copiedExternal, setCopiedExternal] = useState(false)

	useEffect(() => {
		setIsMounted(true)
	}, [])

	const connectedExternalAddress =
		isMounted && isExternalConnected && externalWalletAddress ? externalWalletAddress : null

	const handleCopy = async (address: string, type: 'smart' | 'external') => {
		try {
			await navigator.clipboard.writeText(address)
			if (type === 'smart') {
				setCopiedSmartAccount(true)
				setTimeout(() => setCopiedSmartAccount(false), 2000)
			} else {
				setCopiedExternal(true)
				setTimeout(() => setCopiedExternal(false), 2000)
			}
			toast.success(t('profile.addressCopied'))
		} catch {
			toast.error(t('profile.addressCopyFailed'))
		}
	}

	return (
		<ProfileSurfaceCard className="h-full">
			<WalletCardHeader />
			<div className="mt-5 space-y-4">
				{isSmartAccountEnabled() ? (
					smartAccountAddress ? (
						<div className="space-y-2">
							<div className="flex items-center justify-between gap-2">
								<p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
									{t('profile.smartAccount')}
								</p>
								<Badge variant="secondary" className="rounded-full text-[10px]">
									{t('profile.primaryWallet')}
								</Badge>
							</div>
							<AddressRow
								address={smartAccountAddress}
								isCopied={copiedSmartAccount}
								onCopy={() => handleCopy(smartAccountAddress, 'smart')}
							/>
						</div>
					) : (
						<div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-5 text-center text-sm text-muted-foreground">
							{t('profile.smartAccountPending')}
						</div>
					)
				) : null}

				<div className="border-t border-slate-100 pt-4">
					<div className="mb-2 flex items-center gap-2">
						<Link2 className="h-4 w-4 text-slate-400" />
						<p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
							{t('profile.externalWallet')}
						</p>
					</div>

					{connectedExternalAddress ? (
						<div className="space-y-3">
							<AddressRow
								address={connectedExternalAddress}
								isCopied={copiedExternal}
								onCopy={() => handleCopy(connectedExternalAddress, 'external')}
							/>
							<div className="flex gap-2">
								<Button
									variant="outline"
									size="sm"
									className="flex-1 rounded-full"
									onClick={() => handleCopy(connectedExternalAddress, 'external')}
								>
									<Copy className="mr-2 h-3.5 w-3.5" />
									{t('profile.copyAddress')}
								</Button>
								{onDisconnectExternal ? (
									<Button
										variant="outline"
										size="sm"
										className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
										onClick={() => {
											onDisconnectExternal()
											toast.success(t('profile.walletDisconnected'))
										}}
									>
										<LogOut className="mr-2 h-3.5 w-3.5" />
										{t('profile.disconnect')}
									</Button>
								) : null}
							</div>
							<p className="text-xs text-muted-foreground">
								{t('profile.externalWalletTrustlessNote')}
							</p>
						</div>
					) : (
						<div className="space-y-3">
							<Button
								onClick={onConnectExternal}
								variant="outline"
								className="w-full rounded-full"
								size="sm"
							>
								<Link2 className="mr-2 h-4 w-4" />
								{t('profile.connectExternalWallet')}
							</Button>
							<p className="text-xs text-muted-foreground">
								{t('profile.externalWalletTrustlessNote')}
							</p>
						</div>
					)}
				</div>
			</div>
		</ProfileSurfaceCard>
	)
}

function WalletCardHeader({ isPollar = false }: { isPollar?: boolean }) {
	const { t } = useI18n()
	return (
		<div className="flex items-start justify-between gap-3">
			<div className="flex items-center gap-3">
				<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
					<Wallet className="h-5 w-5" />
				</div>
				<div>
					<h3 className="text-base font-semibold text-gray-900">{t('profile.walletsTitle')}</h3>
					<p className="text-sm text-muted-foreground">
						{isPollar ? t('auth.pollarWalletReady') : t('profile.walletsSubtitle')}
					</p>
				</div>
			</div>
			<Badge className="rounded-full bg-emerald-50 text-emerald-800 hover:bg-emerald-50">
				{isPollar ? t('auth.pollarWalletReady') : t('profile.passkeySecured')}
			</Badge>
		</div>
	)
}

function AddressRow({
	address,
	isCopied,
	onCopy,
}: {
	address: string
	isCopied: boolean
	onCopy: () => void
}) {
	return (
		<div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-slate-50/70 px-3 py-2.5">
			<code className="truncate font-mono text-sm tracking-wide text-gray-900">
				{truncateAddress(address)}
			</code>
			<Button variant="ghost" size="sm" onClick={onCopy} className="h-8 w-8 shrink-0 p-0">
				{isCopied ? (
					<CheckCircle2 className="h-4 w-4 text-emerald-600" />
				) : (
					<Copy className="h-4 w-4" />
				)}
			</Button>
		</div>
	)
}
