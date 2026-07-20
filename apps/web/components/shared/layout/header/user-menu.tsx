'use client'

import { isSmartAccountEnabled } from '@packages/lib/smart-account'
import { createSupabaseBrowserClient } from '@packages/lib/supabase-client'
import {
	Check,
	Copy,
	ExternalLink,
	Link2,
	LogOut,
	Shield,
	Unlink,
	User as UserIcon,
	Vote,
	Wallet,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { User } from 'next-auth'
import { signOut } from 'next-auth/react'
import { useState } from 'react'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'
import { Avatar, AvatarFallback } from '~/components/base/avatar'
import { Button } from '~/components/base/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '~/components/base/dropdown-menu'
import { useWallet } from '~/hooks/contexts/use-stellar-wallet.context'
import { useI18n } from '~/lib/i18n/context'
import { getAvatarFallback } from '~/lib/utils'
import { getStellarExplorerAddressUrl } from '~/lib/utils/escrow/stellar-explorer'
import { resolveSmartAccountAddress } from '~/lib/utils/wallet-address'

const WalletAddressSection = ({
	address,
	label,
	className,
}: {
	address: string
	label: string
	className?: string
}) => {
	const [copied, setCopied] = useState(false)
	const explorerUrl = getStellarExplorerAddressUrl(address)

	const start = address.substring(0, 8)
	const end = address.substring(address.length - 8)

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(address)
			setCopied(true)
			toast.success('Wallet address copied to clipboard')
			setTimeout(() => setCopied(false), 2000)
		} catch (error) {
			logger.error('Failed to copy address:', error)
			toast.error('Failed to copy address')
		}
	}

	return (
		<div className={['space-y-2', className].filter(Boolean).join(' ')}>
			<div className="px-2">
				<p className="mb-1.5 text-xs font-medium text-muted-foreground">{label}</p>
				<div className="flex items-center gap-1.5 rounded-lg border bg-muted/30 p-2.5">
					<Wallet className="size-4 shrink-0 text-muted-foreground" />
					<span className="min-w-0 flex-1 truncate font-mono text-xs text-foreground">
						{start}...{end}
					</span>
					<Button
						variant="ghost"
						size="sm"
						className="h-7 w-7 shrink-0 p-0"
						onClick={handleCopy}
						title="Copy address"
					>
						{copied ? (
							<Check className="size-3.5 text-green-600" />
						) : (
							<Copy className="size-3.5 text-muted-foreground" />
						)}
					</Button>
					<Button
						variant="ghost"
						size="sm"
						className="h-7 w-7 shrink-0 p-0"
						asChild
						title="View on explorer"
					>
						<a href={explorerUrl} target="_blank" rel="noopener noreferrer">
							<ExternalLink className="size-3.5 text-muted-foreground" />
						</a>
					</Button>
				</div>
			</div>
		</div>
	)
}

export const UserMenu = ({ user }: { user: User }) => {
	const router = useRouter()
	const { t } = useI18n()
	const {
		address: externalWalletAddress,
		isConnected: isExternalConnected,
		connect,
		disconnect,
	} = useWallet()
	const [isSigningOut, setIsSigningOut] = useState(false)
	const [isConnectingExternal, setIsConnectingExternal] = useState(false)

	const smartAccountAddress = isSmartAccountEnabled()
		? resolveSmartAccountAddress(user.device?.address)
		: null

	const handleConnectExternalWallet = async () => {
		if (isConnectingExternal) return

		try {
			setIsConnectingExternal(true)
			await connect()
			toast.success(t('profile.walletConnected'))
		} catch (error) {
			logger.error('Error connecting external wallet:', error)
			toast.error(error instanceof Error ? error.message : 'Failed to connect wallet')
		} finally {
			setIsConnectingExternal(false)
		}
	}

	const handleDisconnectExternalWallet = () => {
		try {
			disconnect()
			toast.success(t('profile.walletDisconnected'))
		} catch (error) {
			logger.error('Error disconnecting external wallet:', error)
			toast.error(error instanceof Error ? error.message : 'Failed to disconnect wallet')
		}
	}

	const handleSignOutAction = async () => {
		if (isSigningOut) return

		try {
			setIsSigningOut(true)

			try {
				disconnect()
			} catch (error) {
				logger.error('Error disconnecting wallet:', error)
			}

			try {
				const supabase = createSupabaseBrowserClient()
				await supabase.auth.signOut()
			} catch (error) {
				logger.error('Error signing out from Supabase:', error)
			}

			await signOut({
				callbackUrl: '/sign-in?success=Successfully signed out',
			})
		} catch (error) {
			logger.error('Error signing out:', error)
			toast.error(t('auth.signOutError'))
			router.push('/')
			setIsSigningOut(false)
		}
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					aria-label={t('aria.openUserMenu')}
					className="relative h-9 w-9 rounded-full transition-all hover:ring-2 hover:ring-green-900/20"
				>
					<Avatar className="h-9 w-9 border-2 border-border shadow-sm">
						<AvatarFallback
							suppressHydrationWarning
							className="bg-gradient-to-br from-green-50 to-green-100 text-green-700"
						>
							{getAvatarFallback(user.email || '')}
						</AvatarFallback>
					</Avatar>
					{user.email?.split('@')[0] && (
						<span className="absolute right-0 top-0 h-3 w-3 rounded-full bg-green-500 shadow-sm ring-2 ring-background">
							<span className="sr-only">{t('user.online')}</span>
						</span>
					)}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-72 p-2">
				{/* User Info Section */}
				<div className="space-y-3 px-2 py-3">
					<div className="flex items-center gap-3">
						<Avatar className="h-12 w-12 border-2 border-border shadow-sm">
							<AvatarFallback
								suppressHydrationWarning
								className="bg-gradient-to-br from-green-50 to-green-100 text-base text-green-700"
							>
								{getAvatarFallback(user.email || '')}
							</AvatarFallback>
						</Avatar>
						<div className="min-w-0 flex-1 flex-col">
							<p className="truncate text-sm font-semibold leading-tight">
								{user.name || user.email}
							</p>
							<p className="mt-0.5 truncate text-xs leading-tight text-muted-foreground">
								{user.email}
							</p>
						</div>
						{user.email?.split('@')[0] && (
							<span className="h-2.5 w-2.5 shrink-0 rounded-full bg-green-500">
								<span className="sr-only">{t('user.online')}</span>
							</span>
						)}
					</div>
					{smartAccountAddress ? (
						<WalletAddressSection address={smartAccountAddress} label={t('profile.smartAccount')} />
					) : null}
					{isExternalConnected && externalWalletAddress ? (
						<WalletAddressSection
							address={externalWalletAddress}
							label={t('profile.externalWallet')}
						/>
					) : null}
				</div>

				<DropdownMenuSeparator />

				{/* External Stellar wallet (Wallets Kit) — separate from smart account */}
				<div className="py-1">
					{isExternalConnected && externalWalletAddress ? (
						<DropdownMenuItem className="cursor-pointer" onSelect={handleDisconnectExternalWallet}>
							<Unlink className="h-4 w-4 text-muted-foreground" />
							<span className="font-medium">{t('profile.disconnectExternalWallet')}</span>
						</DropdownMenuItem>
					) : (
						<DropdownMenuItem
							className="cursor-pointer"
							disabled={isConnectingExternal}
							onSelect={handleConnectExternalWallet}
						>
							<Link2 className="h-4 w-4 text-emerald-600" />
							<span className="font-medium">
								{isConnectingExternal
									? t('profile.connectingExternalWallet')
									: t('profile.connectExternalWallet')}
							</span>
						</DropdownMenuItem>
					)}
				</div>

				<DropdownMenuSeparator />

				{/* Menu Items */}
				<div className="py-1">
					<DropdownMenuItem asChild className="cursor-pointer">
						<Link
							href="/profile"
							className="flex items-center gap-2 rounded-md px-2 py-2 transition-colors hover:bg-accent"
						>
							<UserIcon className="h-4 w-4 text-muted-foreground" />
							<span className="font-medium">{t('nav.dashboard')}</span>
						</Link>
					</DropdownMenuItem>
					<DropdownMenuItem asChild className="cursor-pointer">
						<Link
							href="/governance"
							className="flex items-center gap-2 rounded-md px-2 py-2 transition-colors hover:bg-accent"
						>
							<Vote className="h-4 w-4 text-emerald-600" />
							<span className="font-medium">{t('nav.governance')}</span>
						</Link>
					</DropdownMenuItem>
					{(user as { role?: string })?.role === 'admin' && (
						<DropdownMenuItem asChild className="cursor-pointer">
							<Link
								href="/admin"
								className="flex items-center gap-2 rounded-md px-2 py-2 transition-colors hover:bg-accent"
							>
								<Shield className="h-4 w-4 text-purple-600" />
								<span className="font-medium">Admin Dashboard</span>
							</Link>
						</DropdownMenuItem>
					)}
				</div>

				<DropdownMenuSeparator />

				<div className="py-1">
					<DropdownMenuItem asChild>
						<button
							type="button"
							onClick={handleSignOutAction}
							disabled={isSigningOut}
							className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-destructive transition-colors hover:bg-destructive/10 focus:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50"
						>
							<LogOut className="h-4 w-4" />
							<span className="font-medium">
								{isSigningOut ? t('auth.signingOut') : t('nav.closeSession')}
							</span>
						</button>
					</DropdownMenuItem>
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
