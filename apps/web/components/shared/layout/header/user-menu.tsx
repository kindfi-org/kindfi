'use client'

import { createSupabaseBrowserClient } from '@packages/lib/supabase-client'
import {
	Check,
	Copy,
	ExternalLink,
	LogOut,
	User as UserIcon,
	Wallet,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { User } from 'next-auth'
import { signOut } from 'next-auth/react'
import { useState } from 'react'
import { toast } from 'sonner'
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
import { getStellarExplorerUrl } from '~/lib/utils/escrow/stellar-explorer'

const WalletAddressSection = ({
	address,
	className,
}: {
	address: string
	className?: string
}) => {
	const [copied, setCopied] = useState(false)
	const explorerUrl = getStellarExplorerUrl(address)

	const start = address.substring(0, 8)
	const end = address.substring(address.length - 8)

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(address)
			setCopied(true)
			toast.success('Wallet address copied to clipboard')
			setTimeout(() => setCopied(false), 2000)
		} catch (error) {
			console.error('Failed to copy address:', error)
			toast.error('Failed to copy address')
		}
	}

	return (
		<div className={['space-y-2', className].filter(Boolean).join(' ')}>
			<div className="px-2">
				<p className="text-xs font-medium text-muted-foreground mb-1.5">
					Wallet Address
				</p>
				<div className="flex items-center gap-1.5 p-2.5 rounded-lg border bg-muted/30">
					<Wallet className="size-4 text-muted-foreground shrink-0" />
					<span className="text-xs font-mono text-foreground flex-1 min-w-0 truncate">
						{start}...{end}
					</span>
					<Button
						variant="ghost"
						size="sm"
						className="h-7 w-7 p-0 shrink-0"
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
						className="h-7 w-7 p-0 shrink-0"
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
	const { disconnect } = useWallet()
	const [isSigningOut, setIsSigningOut] = useState(false)

	const handleSignOutAction = async () => {
		if (isSigningOut) return

		try {
			setIsSigningOut(true)

			try {
				disconnect()
			} catch (error) {
				console.error('Error disconnecting wallet:', error)
			}

			try {
				const supabase = createSupabaseBrowserClient()
				await supabase.auth.signOut()
			} catch (error) {
				console.error('Error signing out from Supabase:', error)
			}

			await signOut({
				callbackUrl: '/sign-in?success=Successfully signed out',
			})
		} catch (error) {
			console.error('Error signing out:', error)
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
						<span className="absolute right-0 top-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-background shadow-sm">
							<span className="sr-only">{t('user.online')}</span>
						</span>
					)}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-72 p-2">
				{/* User Info Section */}
				<div className="px-2 py-3 space-y-3">
					<div className="flex items-center gap-3">
						<Avatar className="h-12 w-12 border-2 border-border shadow-sm">
							<AvatarFallback
								suppressHydrationWarning
								className="bg-gradient-to-br from-green-50 to-green-100 text-green-700 text-base"
							>
								{getAvatarFallback(user.email || '')}
							</AvatarFallback>
						</Avatar>
						<div className="flex flex-col min-w-0 flex-1">
							<p className="text-sm font-semibold leading-tight truncate">
								{user.name || user.email}
							</p>
							<p className="text-xs text-muted-foreground leading-tight truncate mt-0.5">
								{user.email}
							</p>
						</div>
						{user.email?.split('@')[0] && (
							<span className="h-2.5 w-2.5 rounded-full bg-green-500 shrink-0">
								<span className="sr-only">{t('user.online')}</span>
							</span>
						)}
					</div>
					{user.device?.address && (
						<WalletAddressSection address={user.device.address} />
					)}
				</div>

				<DropdownMenuSeparator />

				{/* Menu Items */}
				<div className="py-1">
					<DropdownMenuItem asChild className="cursor-pointer">
						<Link
							href="/profile"
							className="flex items-center gap-2 px-2 py-2 rounded-md transition-colors hover:bg-accent"
						>
							<UserIcon className="h-4 w-4 text-muted-foreground" />
							<span className="font-medium">{t('nav.dashboard')}</span>
						</Link>
					</DropdownMenuItem>
				</div>

				<DropdownMenuSeparator />

				<div className="py-1">
					<DropdownMenuItem asChild>
						<button
							type="button"
							onClick={handleSignOutAction}
							disabled={isSigningOut}
							className="flex w-full items-center gap-2 px-2 py-2 rounded-md transition-colors cursor-pointer text-destructive hover:bg-destructive/10 focus:bg-destructive/10 disabled:opacity-50 disabled:cursor-not-allowed"
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
